import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { PromptService } from './application/prompt.service';
import { PromptRepository } from './infrastructure/repository/prompt.repository';
import { PromptQueueProducer } from './infrastructure/queue/prompt-queue.producer';
import { PromptController } from './interface/controllers/prompt.controller';
import { PromptQueueScheduler } from './infrastructure/scheduler/prompt-queue.scheduler';
import { PromptGenerationWorker } from './infrastructure/worker/prompt-generation.worker';
import { PromptEventsGateway } from './infrastructure/websockets/prompt-events.gateway';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    PromptService,
    PromptRepository,
    PromptQueueScheduler,
    PromptQueueProducer,
    PromptGenerationWorker,
    PromptEventsGateway,
  ],
  controllers: [PromptController],
})
export class PromptModule {}
