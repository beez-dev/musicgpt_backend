import { Global, Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module';
import { RateLimitService } from './rate-limit.service';
import { SubscriptionRateLimitGuard } from './subscription-rate-limit.guard';

@Global()
@Module({
  imports: [UserModule],
  providers: [RateLimitService, SubscriptionRateLimitGuard],
  exports: [RateLimitService, SubscriptionRateLimitGuard],
})
export class RateLimitModule {}
