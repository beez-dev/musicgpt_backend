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
import { AudioService } from '../../application/audio.service';
import { PaginatedQueryDto } from '../dto/paginated-query.dto';
import { UpdateAudioDto } from '../dto/update-audio.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/interface/decorators/current-user.decorator';

@Controller('audio')
@ApiTags('audio')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get()
  @ApiOperation({ summary: 'List audio with pagination' })
  listAudio(@Query() query: PaginatedQueryDto) {
    return this.audioService.listAudio(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audio by id' })
  getAudioById(@Param('id') id: string) {
    return this.audioService.getAudioById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update audio minimal fields' })
  updateAudio(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: UpdateAudioDto,
  ) {
    return this.audioService.updateAudio(id, currentUserId, dto);
  }
}
