import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PromptRepository } from '../repository/prompt.repository';
import { PromptQueueProducer } from '../queue/prompt-queue.producer';

@Injectable()
export class PromptQueueScheduler {
  private readonly logger = new Logger(PromptQueueScheduler.name);

  constructor(
    private readonly promptRepository: PromptRepository,
    private readonly promptQueueProducer: PromptQueueProducer,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async enqueuePendingPrompts() {
    const pending = await this.promptRepository.findPendingPromptsForQueue(100);
    if (!pending.length) {
      return;
    }

    let newlyQueued = 0;
    for (const prompt of pending) {
      const result =
        await this.promptQueueProducer.enqueuePromptGenerationIfMissing({
          promptId: prompt.id,
          userId: prompt.userId,
          subscriptionStatus: prompt.subscriptionStatus,
        });
      if (!result.alreadyQueued) {
        newlyQueued += 1;
      }
    }

    this.logger.debug(
      `Cron scanned ${pending.length} pending prompts; queued ${newlyQueued} new jobs`,
    );
  }
}
