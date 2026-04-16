import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PromptService } from './application/prompt.service';
import { PromptRepository } from './infrastructure/repository/prompt.repository';
import { PromptQueueProducer } from './infrastructure/queue/prompt-queue.producer';
import { PromptController } from './interface/controllers/prompt.controller';
import { PromptQueueScheduler } from './infrastructure/scheduler/prompt-queue.scheduler';
import { PromptGenerationWorker } from './infrastructure/worker/prompt-generation.worker';

@Module({
  imports: [UserModule],
  providers: [
    PromptService,
    PromptRepository,
    PromptQueueScheduler,
    PromptQueueProducer,
    PromptGenerationWorker,
  ],
  controllers: [PromptController],
})
export class PromptModule {}
