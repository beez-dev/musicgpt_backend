import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type IORedis from 'ioredis';
import { AudioRepository } from '../infrastructure/repository/audio.repository';
import { PaginatedQueryDto } from '../interface/dto/paginated-query.dto';
import { UpdateAudioDto } from '../interface/dto/update-audio.dto';
import { QUEUE_CONNECTION } from '../../common/queue/queue.constants';
import { CRUD_CACHE_TTL_SECONDS } from '../../common/cache/cache.constants';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);

  constructor(
    private readonly audioRepository: AudioRepository,
    @Inject(QUEUE_CONNECTION) private readonly redis: IORedis,
  ) {}

  private listCacheKey(page: number, limit: number) {
    return `cache:audio:list:page:${page}:limit:${limit}`;
  }

  private itemCacheKey(id: string) {
    return `cache:audio:item:${id}`;
  }

  private async getCachedJson<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (e) {
      this.logger.warn(
        `Audio cache read failed for ${key}: ${(e as Error).message}`,
      );
      return null;
    }
  }

  private async setCachedJson(key: string, value: unknown): Promise<void> {
    try {
      await this.redis.set(
        key,
        JSON.stringify(value),
        'EX',
        CRUD_CACHE_TTL_SECONDS,
      );
    } catch (e) {
      this.logger.warn(
        `Audio cache write failed for ${key}: ${(e as Error).message}`,
      );
    }
  }

  private async deleteByPattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          '100',
        );
        cursor = nextCursor;
        if (keys.length) {
          await this.redis.del(...keys);
        }
      } while (cursor !== '0');
    } catch (e) {
      this.logger.warn(
        `Audio cache invalidation failed for ${pattern}: ${(e as Error).message}`,
      );
    }
  }

  private async invalidateAudioCaches(audioId: string): Promise<void> {
    try {
      await this.redis.del(this.itemCacheKey(audioId));
    } catch (e) {
      this.logger.warn(
        `Audio cache invalidation failed for item ${audioId}: ${(e as Error).message}`,
      );
    }

    await this.deleteByPattern('cache:audio:list:*');
  }

  async listAudio(query: PaginatedQueryDto) {
    const cacheKey = this.listCacheKey(query.page, query.limit);
    const cached = await this.getCachedJson<{
      data: Array<{
        id: string;
        promptId: string;
        userId: string;
        title: string;
        url: string;
        createdAt: string;
      }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const pageResult = await this.audioRepository.findPaginated(
      query.page,
      query.limit,
    );
    const response = {
      ...pageResult,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(pageResult.total / query.limit),
    };
    await this.setCachedJson(cacheKey, response);
    return response;
  }

  async getAudioById(id: string) {
    const cacheKey = this.itemCacheKey(id);
    const cached = await this.getCachedJson<{
      id: string;
      promptId: string;
      userId: string;
      title: string;
      url: string;
      createdAt: string;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const audio = await this.audioRepository.findById(id);
    if (!audio) {
      throw new NotFoundException('Audio not found');
    }
    await this.setCachedJson(cacheKey, audio);
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
    await this.invalidateAudioCaches(id);
    return audio;
  }
}
