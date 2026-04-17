import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SubscriptionService } from '../../application/subscription.service';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/interface/decorators/current-user.decorator';
import { SubscriptionRateLimitGuard } from '../../../common/rate-limit/subscription-rate-limit.guard';
import { HttpErrorResponseDto } from '../../../common/swagger/http-error-response.dto';
import { SubscriptionStatusResponseDto } from '../dto/subscription-status-response.dto';

@Controller('subscription')
@ApiTags('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, SubscriptionRateLimitGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Upgrade to PAID tier',
    description:
      'Sets `subscriptionStatus` to **PAID** (higher BullMQ priority and higher shared per-minute request budget).',
  })
  @ApiOkResponse({ type: SubscriptionStatusResponseDto })
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
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
  subscribe(@CurrentUser('id') userId: string) {
    return this.subscriptionService.subscribe(userId);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, SubscriptionRateLimitGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Downgrade to FREE tier',
    description:
      'Sets `subscriptionStatus` to **FREE** (default BullMQ priority and lower shared per-minute budget).',
  })
  @ApiOkResponse({ type: SubscriptionStatusResponseDto })
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
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
  cancel(@CurrentUser('id') userId: string) {
    return this.subscriptionService.cancel(userId);
  }
}
