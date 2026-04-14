import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './interface/controllers/user.controller';
import { UserRepository } from './infrastructure/repository/user.repository';

@Module({
  providers: [UserService, UserRepository],
  controllers: [UserController],
  exports: [UserRepository],
})
export class UserModule {}
