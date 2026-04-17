/* Prisma client queries are fully typed at compile time; ESLint does not always infer delegates from `extends PrismaClient`. */

import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../infrastructure/generated/prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import {
  IUserRepository,
  UserPage,
  UserPublic,
  UserSummary,
  UserWithPassword,
  UserWithRefreshHash,
  UserSubscription,
} from '../../domain/respositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<UserSummary | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        subscriptionStatus: true,
      },
    });
  }

  async findPaginated(page: number, limit: number): Promise<UserPage> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          displayName: true,
          subscriptionStatus: true,
        },
      }),
      this.prisma.user.count(),
    ]);
    return { data, total };
  }

  async findByEmail(email: string): Promise<UserPublic | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, displayName: true },
    });
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPassword | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        password: true,
      },
    });
  }

  async findByIdWithRefreshHash(
    id: string,
  ): Promise<UserWithRefreshHash | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, hashedRefreshToken: true },
    });
  }

  async findByIdWithSubscription(id: string): Promise<UserSubscription | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, subscriptionStatus: true },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<UserPublic> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      },
      select: { id: true, email: true, displayName: true },
    });
  }

  async updateHashedRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }

  async updateSubscriptionStatus(
    userId: string,
    subscriptionStatus: 'FREE' | 'PAID',
  ): Promise<UserSubscription | null> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus },
        select: { id: true, subscriptionStatus: true },
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

  async updateBasicProfile(
    userId: string,
    data: { displayName?: string },
  ): Promise<UserSummary | null> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { displayName: data.displayName },
        select: {
          id: true,
          email: true,
          displayName: true,
          subscriptionStatus: true,
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
