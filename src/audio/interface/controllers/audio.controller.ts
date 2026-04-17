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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AudioService } from '../../application/audio.service';
import { PaginatedQueryDto } from '../dto/paginated-query.dto';
import { UpdateAudioDto } from '../dto/update-audio.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/interface/decorators/current-user.decorator';
import { HttpErrorResponseDto } from '../../../common/swagger/http-error-response.dto';
import {
  AudioSummaryResponseDto,
  PaginatedAudioResponseDto,
} from '../../../common/swagger/audio.swagger.dto';

@Controller('audio')
@ApiTags('audio')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get()
  @ApiOperation({
    summary: 'List audio with pagination',
    description: 'Page/limit pagination over audio rows (newest first). May be cache-backed.',
  })
  @ApiOkResponse({ type: PaginatedAudioResponseDto })
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
  listAudio(@Query() query: PaginatedQueryDto) {
    return this.audioService.listAudio(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audio by id' })
  @ApiOkResponse({ type: AudioSummaryResponseDto })
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
  @ApiNotFoundResponse({
    description: 'Unknown audio id.',
    type: HttpErrorResponseDto,
  })
  getAudioById(@Param('id') id: string) {
    return this.audioService.getAudioById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update own audio title',
    description: 'Only the owning user may update (`userId` must match JWT subject).',
  })
  @ApiOkResponse({ type: AudioSummaryResponseDto })
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
  @ApiForbiddenResponse({
    description: 'Audio belongs to another user.',
    type: HttpErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Audio not found.',
    type: HttpErrorResponseDto,
  })
  updateAudio(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: UpdateAudioDto,
  ) {
    return this.audioService.updateAudio(id, currentUserId, dto);
  }
}
