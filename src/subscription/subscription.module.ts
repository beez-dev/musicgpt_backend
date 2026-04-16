import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { SubscriptionService } from './application/subscription.service';
import { SubscriptionController } from './interface/controllers/subscription.controller';

@Module({
  imports: [UserModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
