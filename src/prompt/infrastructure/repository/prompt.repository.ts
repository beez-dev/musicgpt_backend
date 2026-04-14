/* Prisma delegates are strongly typed; ESLint may not infer from extended PrismaClient. */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { IPromptRepository } from '../../domain/repositories/prompt.repository.interface';
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
}
