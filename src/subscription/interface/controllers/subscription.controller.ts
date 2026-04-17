import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { SubscriptionService } from '../../application/subscription.service';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/interface/decorators/current-user.decorator';
import { SubscriptionRateLimitGuard } from '../../../common/rate-limit/subscription-rate-limit.guard';
import { SubscriptionStatusResponseDto } from '../dto/subscription-status-response.dto';

@Controller('subscription')
@ApiTags('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, SubscriptionRateLimitGuard)
  @ApiBearerAuth('access-token')
  @ApiTooManyRequestsResponse({
    description:
      'Shared per-user per-minute budget exceeded (HTTP + socket handshake). See Retry-After.',
  })
  @ApiServiceUnavailableResponse({
    description: 'Redis unavailable; requests denied (fail closed).',
  })
  @ApiOperation({ summary: 'Set subscription to paid' })
  @ApiOkResponse({ type: SubscriptionStatusResponseDto })
  subscribe(@CurrentUser('id') userId: string) {
    return this.subscriptionService.subscribe(userId);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, SubscriptionRateLimitGuard)
  @ApiBearerAuth('access-token')
  @ApiTooManyRequestsResponse({
    description:
      'Shared per-user per-minute budget exceeded (HTTP + socket handshake). See Retry-After.',
  })
  @ApiServiceUnavailableResponse({
    description: 'Redis unavailable; requests denied (fail closed).',
  })
  @ApiOperation({ summary: 'Set subscription to free' })
  @ApiOkResponse({ type: SubscriptionStatusResponseDto })
  cancel(@CurrentUser('id') userId: string) {
    return this.subscriptionService.cancel(userId);
  }
}
