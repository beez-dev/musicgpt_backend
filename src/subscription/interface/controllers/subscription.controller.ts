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
  ApiTags,
} from '@nestjs/swagger';
import { SubscriptionService } from '../../application/subscription.service';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/interface/decorators/current-user.decorator';
import { SubscriptionStatusResponseDto } from '../dto/subscription-status-response.dto';

@Controller('subscription')
@ApiTags('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Set subscription to paid' })
  @ApiOkResponse({ type: SubscriptionStatusResponseDto })
  subscribe(@CurrentUser('id') userId: string) {
    return this.subscriptionService.subscribe(userId);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Set subscription to free' })
  @ApiOkResponse({ type: SubscriptionStatusResponseDto })
  cancel(@CurrentUser('id') userId: string) {
    return this.subscriptionService.cancel(userId);
  }
}
