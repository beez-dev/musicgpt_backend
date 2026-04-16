/* Prisma delegates are strongly typed; ESLint may not infer from extended PrismaClient. */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import {
  IPromptRepository,
  PendingPromptForQueue,
} from '../../domain/repositories/prompt.repository.interface';
import { IPrompt } from '../../domain/entities/prompt.entity.interface';

@Injectable()
export class PromptRepository implements IPromptRepository {
  constructor(private readonly prisma: PrismaService) {}

  createPendingPrompt(data: {
    userId: string;
    text: string;
  }): Promise<IPrompt> {
    return this.prisma.prompt.create({
      data: {
        userId: data.userId,
        text: data.text,
        status: 'PENDING',
      },
    });
  }

  async findPendingPromptsForQueue(
    limit: number,
  ): Promise<PendingPromptForQueue[]> {
    return this.prisma.prompt
      .findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: limit,
        select: {
          id: true,
          userId: true,
          user: {
            select: { subscriptionStatus: true },
          },
        },
      })
      .then((rows) =>
        rows.map((row) => ({
          id: row.id,
          userId: row.userId,
          subscriptionStatus: row.user.subscriptionStatus,
        })),
      );
  }

  async markPromptStatus(
    promptId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED',
  ): Promise<void> {
    await this.prisma.prompt.update({
      where: { id: promptId },
      data: { status },
    });
  }

  async createAudioForPrompt(data: {
    promptId: string;
    userId: string;
  }): Promise<void> {
    const suffix = data.promptId.slice(0, 8); // take initial letters from prompt as title for generation
    await this.prisma.audio.create({
      data: {
        promptId: data.promptId,
        userId: data.userId,
        title: `Generated track ${suffix})`,
        url: `https://cdn.musicgpt.local/audio/${data.promptId}.mp3`,
      },
    });
  }
}
