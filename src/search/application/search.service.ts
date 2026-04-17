import { Injectable } from '@nestjs/common';
import type {
  AudioSearchRow,
  UserSearchRow,
} from '../domain/repositories/search.repository.interface';
import { SearchRepository } from '../infrastructure/repository/search.repository';
import { SearchQueryDto } from '../interface/dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async search(dto: SearchQueryDto) {
    const q = dto.q.trim();
    const limit = dto.limit;
    const take = limit + 1;

    const usersOffset = dto.users_offset ?? 0;
    const audioOffset = dto.audio_offset ?? 0;

    const [userRows, audioRows] = await Promise.all([
      this.searchRepository.findUsersRankedByQuery(q, take, usersOffset),
      this.searchRepository.findAudioRankedByQuery(q, take, audioOffset),
    ]);

    return {
      users: this.buildUsersSection(userRows, limit, usersOffset),
      audio: this.buildAudioSection(audioRows, limit, audioOffset),
    };
  }

  private buildUsersSection(
    rows: UserSearchRow[],
    limit: number,
    offset: number,
  ) {
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const nextOffset = hasMore ? offset + pageRows.length : null;
    return {
      data: pageRows.map((row) => ({
        id: row.id,
        email: row.email,
        displayName: row.display_name,
      })),
      meta: { next_offset: nextOffset },
    };
  }

  private buildAudioSection(
    rows: AudioSearchRow[],
    limit: number,
    offset: number,
  ) {
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const nextOffset = hasMore ? offset + pageRows.length : null;
    return {
      data: pageRows.map((row) => ({
        id: row.id,
        promptId: row.prompt_id,
        userId: row.user_id,
        title: row.title,
        createdAt: row.created_at,
      })),
      meta: { next_offset: nextOffset },
    };
  }
}
