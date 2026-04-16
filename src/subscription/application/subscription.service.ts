import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../user/infrastructure/repository/user.repository';

@Injectable()
export class SubscriptionService {
  constructor(private readonly userRepository: UserRepository) {}

  async subscribe(userId: string) {
    const user = await this.userRepository.updateSubscriptionStatus(
      userId,
      'PAID',
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async cancel(userId: string) {
    const user = await this.userRepository.updateSubscriptionStatus(
      userId,
      'FREE',
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
