import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  PROMPT_GENERATION_QUEUE,
  PROMPT_GENERATION_QUEUE_NAME,
  PromptGenerationJob,
} from '../../../common/queue/queue.constants';

@Injectable()
export class PromptQueueProducer {
  constructor(
    @Inject(PROMPT_GENERATION_QUEUE)
    private readonly promptQueue: Queue<PromptGenerationJob>,
  ) {}

  async enqueuePromptGeneration(payload: PromptGenerationJob) {
    const priority = payload.subscriptionStatus === 'PAID' ? 1 : 5;
    const job = await this.promptQueue.add(
      PROMPT_GENERATION_QUEUE_NAME,
      payload,
      {
        jobId: payload.promptId,
        priority,
        removeOnComplete: 1000,
        removeOnFail: 1000,
      },
    );
    return { jobId: job.id, queueName: this.promptQueue.name, priority };
  }
}
