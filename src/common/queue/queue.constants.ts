export const QUEUE_CONNECTION = 'QUEUE_CONNECTION';
export const PROMPT_GENERATION_QUEUE = 'MUSIC_GENERATION_QUEUE';
export const PROMPT_GENERATION_QUEUE_NAME = 'MUSIC_GENERATION';

export type PromptGenerationJob = {
  promptId: string;
  userId: string;
  subscriptionStatus: 'FREE' | 'PAID';
};
