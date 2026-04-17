import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '../../application/user.service';
import { PaginatedQueryDto } from '../dto/paginated-query.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { SubscriptionRateLimitGuard } from '../../../common/rate-limit/subscription-rate-limit.guard';
import { CurrentUser } from '../../../auth/infrastructure/interface/decorators/current-user.decorator';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SubscriptionRateLimitGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List users with pagination' })
  listUsers(@Query() query: PaginatedQueryDto) {
    return this.userService.listUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user minimal fields' })
  updateUser(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, currentUserId, dto);
  }
}
