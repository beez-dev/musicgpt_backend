import { IUser } from '../entities/user.entity.interface';

export type UserPublic = {
  id: string;
  email: string;
  displayName: string;
};

export type UserWithPassword = UserPublic & { password: string };

export type UserWithRefreshHash = {
  id: string;
  email: string;
  hashedRefreshToken: string | null;
};

export type UserSubscription = {
  id: string;
  subscriptionStatus: 'FREE' | 'PAID';
};

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<UserPublic | null>;
  findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
  findByIdWithRefreshHash(id: string): Promise<UserWithRefreshHash | null>;
  findByIdWithSubscription(id: string): Promise<UserSubscription | null>;
  createUser(data: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<UserPublic>;
  updateHashedRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ): Promise<void>;
  updateSubscriptionStatus(
    userId: string,
    subscriptionStatus: 'FREE' | 'PAID',
  ): Promise<UserSubscription | null>;
}
