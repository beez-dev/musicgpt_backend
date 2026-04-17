import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { PromptService } from '../../application/prompt.service';
import { CreatePromptDto } from '../dto/create-prompt.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/interface/decorators/current-user.decorator';
import { SubscriptionRateLimitGuard } from '../../../common/rate-limit/subscription-rate-limit.guard';

@Controller('prompts')
@ApiTags('prompts')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SubscriptionRateLimitGuard)
  @ApiBearerAuth('access-token')
  @ApiTooManyRequestsResponse({
    description:
      'Shared per-user per-minute budget exceeded (HTTP + socket handshake). See Retry-After.',
  })
  @ApiServiceUnavailableResponse({
    description: 'Redis unavailable; requests denied (fail closed).',
  })
  @ApiOperation({ summary: 'Create prompt and enqueue generation job' })
  createPrompt(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePromptDto,
  ) {
    return this.promptService.createPrompt(userId, dto);
  }
}
