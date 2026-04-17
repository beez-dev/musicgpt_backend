import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './infrastructure/prisma.module';
import { QueueModule } from './infrastructure/queue.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PromptModule } from './prompt/prompt.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { RateLimitModule } from './common/rate-limit/rate-limit.module';
import { AudioModule } from './audio/audio.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // init required
    AppConfigModule,
    PrismaModule,
    QueueModule,
    UserModule,
    RateLimitModule,
    AuthModule,
    PromptModule,
    SubscriptionModule,
    AudioModule,
    SearchModule,
  ],
})
export class AppModule {}
