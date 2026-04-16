import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import {
  PROMPT_GENERATION_QUEUE_NAME,
  PromptGenerationJob,
  QUEUE_CONNECTION,
} from '../../../common/queue/queue.constants';
import { PromptRepository } from '../repository/prompt.repository';

@Injectable()
export class PromptGenerationWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PromptGenerationWorker.name);
  private worker?: Worker<PromptGenerationJob>;

  constructor(
    @Inject(QUEUE_CONNECTION)
    private readonly connection: IORedis,
    private readonly promptRepository: PromptRepository,
  ) {}

  onModuleInit() {
    this.worker = new Worker<PromptGenerationJob>(
      PROMPT_GENERATION_QUEUE_NAME,
      async (job) => {
        const { promptId, userId } = job.data;
        try {
          await this.promptRepository.markPromptStatus(promptId, 'PROCESSING');
          await this.simulateGenerationDelay();
          await this.promptRepository.createAudioForPrompt({
            promptId,
            userId,
          });
          await this.promptRepository.markPromptStatus(promptId, 'COMPLETED');
        } catch (error) {
          await this.promptRepository.markPromptStatus(promptId, 'PENDING');
          throw error;
        }
      },
      {
        connection: this.connection,
        concurrency: 4,
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Prompt generation completed for prompt ${job.id}`);
    });
    this.worker.on('failed', (job, error) => {
      this.logger.error(
        `Prompt generation failed for prompt ${job?.id ?? 'unknown'}: ${error.message}`,
      );
    });
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
  }

  private async simulateGenerationDelay() {
    const delayMs = 3_000 + Math.floor(Math.random() * 4_000);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
