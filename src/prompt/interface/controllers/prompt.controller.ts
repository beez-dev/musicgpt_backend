import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PromptService } from '../../application/prompt.service';
import { CreatePromptDto } from '../dto/create-prompt.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/interface/decorators/current-user.decorator';
import { SubscriptionRateLimitGuard } from '../../../common/rate-limit/subscription-rate-limit.guard';
import { HttpErrorResponseDto } from '../../../common/swagger/http-error-response.dto';
import { CreatePromptResponseDto } from '../../../common/swagger/prompt.swagger.dto';

@Controller('prompts')
@ApiTags('prompts')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SubscriptionRateLimitGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create prompt (starts simulation pipeline)',
    description:
      'Creates a **PENDING** row. A cron job enqueues BullMQ work; the worker moves through **PROCESSING** → **COMPLETED** and emits **`prompt.completed`** over Socket.IO. See top-level API description for the full lifecycle.',
  })
  @ApiCreatedResponse({
    type: CreatePromptResponseDto,
    description:
      'Prompt persisted as **PENDING**; `queue` field explains that scheduling happens on the next cron tick.',
  })
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
  @ApiNotFoundResponse({
    description: 'Authenticated user record missing.',
    type: HttpErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description:
      'Shared per-user per-minute budget exceeded (HTTP + socket handshake). See **Retry-After**.',
    type: HttpErrorResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Redis unavailable; requests denied (fail closed).',
    type: HttpErrorResponseDto,
  })
  createPrompt(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePromptDto,
  ) {
    return this.promptService.createPrompt(userId, dto);
  }
}
