import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from '../../application/user.service';
import { PaginatedQueryDto } from '../dto/paginated-query.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { SubscriptionRateLimitGuard } from '../../../common/rate-limit/subscription-rate-limit.guard';
import { CurrentUser } from '../../../auth/infrastructure/interface/decorators/current-user.decorator';
import { HttpErrorResponseDto } from '../../../common/swagger/http-error-response.dto';
import {
  PaginatedUsersResponseDto,
  UserSummaryResponseDto,
} from '../../../common/swagger/user.swagger.dto';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SubscriptionRateLimitGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'List users with pagination',
    description:
      'Page/limit pagination over all users (newest first). Responses may be served from Redis cache.',
  })
  @ApiOkResponse({ type: PaginatedUsersResponseDto })
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
  @ApiTooManyRequestsResponse({
    description: 'Shared subscription rate limit exceeded. See **Retry-After**.',
    type: HttpErrorResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Redis unavailable (rate limit or cache).',
    type: HttpErrorResponseDto,
  })
  listUsers(@Query() query: PaginatedQueryDto) {
    return this.userService.listUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public user profile by id' })
  @ApiOkResponse({ type: UserSummaryResponseDto })
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
  @ApiNotFoundResponse({
    description: 'Unknown user id.',
    type: HttpErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Shared subscription rate limit exceeded.',
    type: HttpErrorResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Redis unavailable.',
    type: HttpErrorResponseDto,
  })
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update own profile',
    description: '`id` path must match the authenticated user (`403` otherwise).',
  })
  @ApiOkResponse({ type: UserSummaryResponseDto })
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
  @ApiForbiddenResponse({
    description: 'Authenticated user may only update their own `id`.',
    type: HttpErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: HttpErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Shared subscription rate limit exceeded.',
    type: HttpErrorResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Redis unavailable.',
    type: HttpErrorResponseDto,
  })
  updateUser(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, currentUserId, dto);
  }
}
