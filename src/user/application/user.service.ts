import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type IORedis from 'ioredis';
import { QUEUE_CONNECTION } from '../../common/queue/queue.constants';
import { CRUD_CACHE_TTL_SECONDS } from '../../common/cache/cache.constants';
import { UserRepository } from '../infrastructure/repository/user.repository';
import { UpdateUserDto } from '../interface/dto/update-user.dto';
import { PaginatedQueryDto } from '../interface/dto/paginated-query.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    @Inject(QUEUE_CONNECTION) private readonly redis: IORedis,
  ) {}

  private listCacheKey(page: number, limit: number) {
    return `cache:users:list:page:${page}:limit:${limit}`;
  }

  private itemCacheKey(id: string) {
    return `cache:users:item:${id}`;
  }

  private async getCachedJson<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (e) {
      this.logger.warn(`User cache read failed for ${key}: ${(e as Error).message}`);
      return null;
    }
  }

  private async setCachedJson(key: string, value: unknown): Promise<void> {
    try {
      await this.redis.set(
        key,
        JSON.stringify(value),
        'EX',
        CRUD_CACHE_TTL_SECONDS,
      );
    } catch (e) {
      this.logger.warn(`User cache write failed for ${key}: ${(e as Error).message}`);
    }
  }

  private async deleteByPattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          '100',
        );
        cursor = nextCursor;
        if (keys.length) {
          await this.redis.del(...keys);
        }
      } while (cursor !== '0');
    } catch (e) {
      this.logger.warn(
        `User cache invalidation failed for ${pattern}: ${(e as Error).message}`,
      );
    }
  }

  private async invalidateUserCaches(userId: string): Promise<void> {
    try {
      await this.redis.del(this.itemCacheKey(userId));
    } catch (e) {
      this.logger.warn(
        `User cache invalidation failed for item ${userId}: ${(e as Error).message}`,
      );
    }
    await this.deleteByPattern('cache:users:list:*');
  }

  async listUsers(query: PaginatedQueryDto) {
    const cacheKey = this.listCacheKey(query.page, query.limit);
    const cached = await this.getCachedJson<{
      data: Array<{
        id: string;
        email: string;
        displayName: string;
        subscriptionStatus: 'FREE' | 'PAID';
      }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const pageResult = await this.userRepository.findPaginated(
      query.page,
      query.limit,
    );
    const response = {
      ...pageResult,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(pageResult.total / query.limit),
    };
    await this.setCachedJson(cacheKey, response);
    return response;
  }

  async getUserById(id: string) {
    const cacheKey = this.itemCacheKey(id);
    const cached = await this.getCachedJson<{
      id: string;
      email: string;
      displayName: string;
      subscriptionStatus: 'FREE' | 'PAID';
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.setCachedJson(cacheKey, user);
    return user;
  }

  async updateUser(id: string, currentUserId: string, data: UpdateUserDto) {
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const user = await this.userRepository.updateBasicProfile(id, {
      displayName: data.displayName?.trim(),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.invalidateUserCaches(id);
    return user;
  }
}
