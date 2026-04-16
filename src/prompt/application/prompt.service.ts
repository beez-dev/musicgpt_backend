import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePromptDto } from '../interface/dto/create-prompt.dto';
import { PromptRepository } from '../infrastructure/repository/prompt.repository';
import { UserRepository } from '../../user/infrastructure/repository/user.repository';

@Injectable()
export class PromptService {
  constructor(
    private readonly promptRepository: PromptRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createPrompt(userId: string, data: CreatePromptDto) {
    const user = await this.userRepository.findByIdWithSubscription(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const prompt = await this.promptRepository.createPendingPrompt({
      userId,
      text: data.text.trim(),
    });

    return {
      ...prompt,
      queue: {
        queued: false,
        reason: 'Job ready to be queued, waiting for cron to schedule',
      },
    };
  }
}
