import { Injectable } from '@nestjs/common';
import { SearchRepository } from '../infrastructure/repository/search.repository';
import { SearchQueryDto } from '../interface/dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async search(dto: SearchQueryDto) {
    const q = dto.q.trim();
    const limit = dto.limit;
    const offset = (dto.page - 1) * limit;

    const [userRows, audioRows] = await Promise.all([
      this.searchRepository.findUsersRankedByQuery(q, limit, offset),
      this.searchRepository.findAudioRankedByQuery(q, limit, offset),
    ]);

    return {
      users: {
        data: userRows.map((row) => ({
          id: row.id,
          email: row.email,
          displayName: row.display_name,
        })),
        meta: { next_cursor: null as string | null },
      },
      audio: {
        data: audioRows.map((row) => ({
          id: row.id,
          promptId: row.prompt_id,
          userId: row.user_id,
          title: row.title,
          createdAt: row.created_at,
        })),
        meta: { next_cursor: null as string | null },
      },
    };
  }
}
