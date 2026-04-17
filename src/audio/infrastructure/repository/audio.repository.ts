import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../infrastructure/generated/prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma.service';

export type AudioSummary = {
  id: string;
  promptId: string;
  userId: string;
  title: string;
  url: string;
  createdAt: Date;
};

@Injectable()
export class AudioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.audio.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          promptId: true,
          userId: true,
          title: true,
          url: true,
          createdAt: true,
        },
      }),
      this.prisma.audio.count(),
    ]);
    return { data, total };
  }

  async findById(id: string): Promise<AudioSummary | null> {
    return this.prisma.audio.findUnique({
      where: { id },
      select: {
        id: true,
        promptId: true,
        userId: true,
        title: true,
        url: true,
        createdAt: true,
      },
    });
  }

  async updateBasic(
    id: string,
    data: { title?: string },
  ): Promise<AudioSummary | null> {
    try {
      return await this.prisma.audio.update({
        where: { id },
        data,
        select: {
          id: true,
          promptId: true,
          userId: true,
          title: true,
          url: true,
          createdAt: true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        return null;
      }
      throw e;
    }
  }
}
