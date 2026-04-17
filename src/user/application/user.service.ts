import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../infrastructure/repository/user.repository';
import { UpdateUserDto } from '../interface/dto/update-user.dto';
import { PaginatedQueryDto } from '../interface/dto/paginated-query.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async listUsers(query: PaginatedQueryDto) {
    const pageResult = await this.userRepository.findPaginated(
      query.page,
      query.limit,
    );
    return {
      ...pageResult,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(pageResult.total / query.limit),
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, currentUserId: string, data: UpdateUserDto) {
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const user = await this.userRepository.updateBasicProfile(id, {
      displayName: data.displayName?.trim(),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
