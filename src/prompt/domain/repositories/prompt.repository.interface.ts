import { IPrompt } from '../entities/prompt.entity.interface';

export type PendingPromptForQueue = {
  id: string;
  userId: string;
  subscriptionStatus: 'FREE' | 'PAID';
};

export interface IPromptRepository {
  createPendingPrompt(data: { userId: string; text: string }): Promise<IPrompt>;
  findPendingPromptsForQueue(limit: number): Promise<PendingPromptForQueue[]>;
  markPromptStatus(
    promptId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED',
  ): Promise<void>;
  createAudioForPrompt(data: {
    promptId: string;
    userId: string;
  }): Promise<{ id: string; url: string }>;
}
