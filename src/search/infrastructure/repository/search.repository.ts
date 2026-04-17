import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import {
  type AudioSearchRow,
  type ISearchRepository,
  type UserSearchRow,
} from '../../domain/repositories/search.repository.interface';

@Injectable()
export class SearchRepository implements ISearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUsersRankedByQuery(
    q: string,
    limit: number,
    offset: number,
  ): Promise<UserSearchRow[]> {
    return this.prisma.$queryRaw<UserSearchRow[]>`
      SELECT
        u.id,
        u.email,
        u.display_name,
        (
          CASE WHEN lower(u.email) = lower(${q}) THEN 100 ELSE 0 END +
          CASE WHEN lower(u.display_name) = lower(${q}) THEN 90 ELSE 0 END +
          CASE WHEN lower(u.email) LIKE lower(${q}) || '%' THEN 60 ELSE 0 END +
          CASE WHEN lower(u.display_name) LIKE lower(${q}) || '%' THEN 50 ELSE 0 END +
          CASE WHEN lower(u.email) LIKE '%' || lower(${q}) || '%' THEN 30 ELSE 0 END +
          CASE WHEN lower(u.display_name) LIKE '%' || lower(${q}) || '%' THEN 25 ELSE 0 END
        ) AS score
      FROM users u
      WHERE
        lower(u.email) LIKE '%' || lower(${q}) || '%'
        OR lower(u.display_name) LIKE '%' || lower(${q}) || '%'
      ORDER BY
        score DESC,
        u.created_at DESC,
        u.id DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
  }

  async findAudioRankedByQuery(
    q: string,
    limit: number,
    offset: number,
  ): Promise<AudioSearchRow[]> {
    return this.prisma.$queryRaw<AudioSearchRow[]>`
      SELECT
        a.id,
        a.prompt_id,
        a.user_id,
        a.title,
        a.created_at,
        ts_rank(
          to_tsvector('simple', coalesce(a.title, '')),
          websearch_to_tsquery('simple', ${q})
        ) AS rank_score
      FROM audios a
      WHERE
        to_tsvector('simple', coalesce(a.title, ''))
        @@ websearch_to_tsquery('simple', ${q})
      ORDER BY
        rank_score DESC,
        a.created_at DESC,
        a.id DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
  }
}
