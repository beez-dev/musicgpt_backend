/* Prisma client queries are fully typed at compile time; ESLint does not always infer delegates from `extends PrismaClient`. */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import {
  IUserRepository,
  UserPublic,
  UserWithPassword,
  UserWithRefreshHash,
  UserSubscription,
} from '../../domain/respositories/user.repository.interface';
import { IUser } from '../../domain/entities/user.entity.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<IUser | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, subscriptionStatus: true },
    });
    return row;
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
}
