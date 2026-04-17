import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AccessTokenPayload } from '../../auth/domain/types/access-token-payload.type';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class SubscriptionRateLimitGuard implements CanActivate {
  constructor(private readonly rateLimitService: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: AccessTokenPayload }>();
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const res = http.getResponse<Response>();

    try {
      await this.rateLimitService.consumeSharedBudgetUnit(userId);
    } catch (e) {
      if (e instanceof HttpException) {
        if (e.getStatus() === 429) {
          res.setHeader(
            'Retry-After',
            String(RateLimitService.retryAfterSecondsForCurrentWindow()),
          );
        }
        throw e;
      }
      throw e;
    }

    return true;
  }
}
