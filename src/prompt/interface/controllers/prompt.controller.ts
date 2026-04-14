import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromptService } from '../../application/prompt.service';
import { CreatePromptDto } from '../dto/create-prompt.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/interface/decorators/current-user.decorator';

@Controller('prompts')
@ApiTags('prompts')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create prompt and enqueue generation job' })
  createPrompt(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePromptDto,
  ) {
    return this.promptService.createPrompt(userId, dto);
  }
}
