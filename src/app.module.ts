import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './infrastructure/prisma.module';
import { QueueModule } from './infrastructure/queue.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PromptModule } from './prompt/prompt.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    QueueModule,
    UserModule,
    AuthModule,
    PromptModule,
  ],
})
export class AppModule {}
