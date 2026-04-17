import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type IORedis from 'ioredis';
import { UserRepository } from '../../user/infrastructure/repository/user.repository';
import { QUEUE_CONNECTION } from '../queue/queue.constants';
import {
  FREE_SUBSCRIPTION_RATE_LIMIT_PER_MINUTE,
  PAID_SUBSCRIPTION_RATE_LIMIT_PER_MINUTE,
  RATE_LIMIT_WINDOW_TTL_SECONDS,
} from './rate-limit.constants';

const INCR_EXPIRE_LUA = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1]))
end
return current
`;

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(
    @Inject(QUEUE_CONNECTION)
    private readonly redis: IORedis,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Seconds until the current fixed window rolls (for `Retry-After`).
   */
  static retryAfterSecondsForCurrentWindow(): number {
    const bucketStartMs = Math.floor(Date.now() / 60_000) * 60_000;
    const nextBucketMs = bucketStartMs + 60_000;
    return Math.max(1, Math.ceil((nextBucketMs - Date.now()) / 1000));
  }

  private windowBucket(): string {
    return String(Math.floor(Date.now() / 60_000));
  }

  private sharedKey(userId: string): string {
    return `rl:shared:${userId}:${this.windowBucket()}`;
  }

  /**
   * Increments the user's shared per-minute counter. Fails closed if Redis errors.
   * @throws NotFoundException user missing
   * @throws HttpException 429 over tier limit
   * @throws ServiceUnavailableException Redis unavailable
   */
  async consumeSharedBudgetUnit(userId: string): Promise<void> {
    const user = await this.userRepository.findByIdWithSubscription(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const limit =
      user.subscriptionStatus === 'PAID'
        ? PAID_SUBSCRIPTION_RATE_LIMIT_PER_MINUTE
        : FREE_SUBSCRIPTION_RATE_LIMIT_PER_MINUTE;

    const key = this.sharedKey(userId);

    let count: number;
    try {
      const raw: unknown = await this.redis.eval(
        INCR_EXPIRE_LUA,
        1,
        key,
        String(RATE_LIMIT_WINDOW_TTL_SECONDS),
      );
      count = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(count)) {
        this.logger.error(
          `Unexpected Redis eval result for ${key}: ${String(raw)}`,
        );
        throw new ServiceUnavailableException('Rate limit store unavailable');
      }
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      this.logger.error(
        `Redis error during rate limit (fail closed): ${(e as Error).message}`,
      );
      throw new ServiceUnavailableException('Rate limit store unavailable');
    }

    if (count > limit) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
