import { IPrompt } from '../entities/prompt.entity.interface';

export interface IPromptRepository {
  createPendingPrompt(data: { userId: string; text: string }): Promise<IPrompt>;
}
