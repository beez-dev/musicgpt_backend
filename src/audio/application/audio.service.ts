import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AudioRepository } from '../infrastructure/repository/audio.repository';
import { PaginatedQueryDto } from '../interface/dto/paginated-query.dto';
import { UpdateAudioDto } from '../interface/dto/update-audio.dto';

@Injectable()
export class AudioService {
  constructor(private readonly audioRepository: AudioRepository) {}

  async listAudio(query: PaginatedQueryDto) {
    const pageResult = await this.audioRepository.findPaginated(
      query.page,
      query.limit,
    );
    return {
      ...pageResult,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(pageResult.total / query.limit),
    };
  }

  async getAudioById(id: string) {
    const audio = await this.audioRepository.findById(id);
    if (!audio) {
      throw new NotFoundException('Audio not found');
    }

    return audio;
  }

  async updateAudio(id: string, currentUserId: string, data: UpdateAudioDto) {
    const existing = await this.audioRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Audio not found');
    }
    if (existing.userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own audio');
    }

    const audio = await this.audioRepository.updateBasic(id, {
      title: data.title?.trim(),
    });
    if (!audio) {
      throw new NotFoundException('Audio not found');
    }
    return audio;
  }
}
