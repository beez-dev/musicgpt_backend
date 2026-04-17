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

export type UserSummary = {
  id: string;
  email: string;
  displayName: string;
  subscriptionStatus: 'FREE' | 'PAID';
};

export type UserPage = {
  data: UserSummary[];
  total: number;
};

export interface IUserRepository {
  findById(id: string): Promise<UserSummary | null>;
  findPaginated(page: number, limit: number): Promise<UserPage>;
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
  updateBasicProfile(
    userId: string,
    data: { displayName?: string },
  ): Promise<UserSummary | null>;
}
