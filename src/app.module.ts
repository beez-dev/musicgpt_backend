import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './infrastructure/prisma.module';
import { QueueModule } from './infrastructure/queue.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PromptModule } from './prompt/prompt.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // init required
    AppConfigModule,
    PrismaModule,
    QueueModule,
    UserModule,
    AuthModule,
    PromptModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
