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
    take: number,
    offset: number,
  ): Promise<UserSearchRow[]> {
    return this.prisma.$queryRaw<UserSearchRow[]>`
      WITH ranked AS (
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
          ) AS score,
          u.created_at,
          u.id AS sort_id
        FROM users u
        WHERE
          lower(u.email) LIKE '%' || lower(${q}) || '%'
          OR lower(u.display_name) LIKE '%' || lower(${q}) || '%'
      )
      SELECT r.id, r.email, r.display_name
      FROM ranked r
      ORDER BY r.score DESC, r.created_at DESC, r.sort_id DESC
      OFFSET ${offset}
      LIMIT ${take}
    `;
  }

  async findAudioRankedByQuery(
    q: string,
    take: number,
    offset: number,
  ): Promise<AudioSearchRow[]> {
    return this.prisma.$queryRaw<AudioSearchRow[]>`
      WITH ranked AS (
        SELECT
          a.id,
          a.prompt_id,
          a.user_id,
          a.title,
          a.created_at,
          ts_rank(
            to_tsvector('simple', coalesce(a.title, '')),
            websearch_to_tsquery('simple', ${q})
          ) AS rank_score,
          a.id AS sort_id
        FROM audios a
        WHERE
          to_tsvector('simple', coalesce(a.title, ''))
          @@ websearch_to_tsquery('simple', ${q})
      )
      SELECT
        r.id,
        r.prompt_id,
        r.user_id,
        r.title,
        r.created_at
      FROM ranked r
      ORDER BY r.rank_score DESC, r.created_at DESC, r.sort_id DESC
      OFFSET ${offset}
      LIMIT ${take}
    `;
  }
}
