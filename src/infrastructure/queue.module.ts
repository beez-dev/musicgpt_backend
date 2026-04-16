import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import {
  PROMPT_GENERATION_QUEUE,
  PROMPT_GENERATION_QUEUE_NAME,
  QUEUE_CONNECTION,
} from '../common/queue/queue.constants';

@Global()
@Module({
  providers: [
    {
      // Redis client connection
      provide: QUEUE_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = Number(config.get<string>('REDIS_PORT') ?? '6379');
        const db = Number(config.get<string>('REDIS_DB') ?? '0');
        const password = config.get<string>('REDIS_PASSWORD') || undefined;
        return new IORedis({
          host: config.get<string>('REDIS_HOST') ?? '127.0.0.1',
          port,
          db,
          password,
          maxRetriesPerRequest: null,
        });
      },
    },
    // Bull MQ queue instance
    // new Queue(PROMPT_GENERATION_QUEUE_NAME, { connection })
    // BullMQ stores all queue state in Redis, so it needs a Redis client to do every operation.
    {
      provide: PROMPT_GENERATION_QUEUE,
      inject: [QUEUE_CONNECTION],
      useFactory: (connection: IORedis) =>
        new Queue(PROMPT_GENERATION_QUEUE_NAME, { connection }),
    },
  ],
  exports: [QUEUE_CONNECTION, PROMPT_GENERATION_QUEUE],
})
export class QueueModule {}
