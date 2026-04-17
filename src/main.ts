import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import {
  FREE_SUBSCRIPTION_RATE_LIMIT_PER_MINUTE,
  PAID_SUBSCRIPTION_RATE_LIMIT_PER_MINUTE,
} from './common/rate-limit/rate-limit.constants';
import { HttpErrorResponseDto } from './common/swagger/http-error-response.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerDescription = [
    'MusicGPT backend: auth, users, prompts (simulated generation), audio, subscription, and unified search.',
    '',
    '## Authentication',
    '- **access-token** (HTTP Bearer JWT): send `Authorization: Bearer <access>` on protected REST routes.',
    '- **refresh** (HTTP Bearer JWT): send the **refresh** JWT (not the access token) to `POST /auth/refresh`.',
    '',
    '## Pagination',
    '### Page/limit (`GET /users`, `GET /audio`)',
    'Query: `page` (1-based), `limit` (1–100). Responses include `data`, `total`, `page`, `limit`, `totalPages`.',
    '',
    '### Ranked search (`GET /search`)',
    'Query: `q`, `limit`, plus `users_offset` and `audio_offset` (rows to skip in each ranked list).',
    'Use each section’s `meta.next_offset` on the next request; `null` means no more results for that list.',
    '',
    '## Subscription tiers & shared rate limits',
    `Shared **per-user per-minute** budget applies to routes guarded by \`SubscriptionRateLimitGuard\` and to **Socket.IO** connections (same counter).`,
    `- **FREE** (default): **${FREE_SUBSCRIPTION_RATE_LIMIT_PER_MINUTE}** request(s) per minute; BullMQ prompt jobs use **lower** priority.`,
    `- **PAID**: **${PAID_SUBSCRIPTION_RATE_LIMIT_PER_MINUTE}** requests per minute; BullMQ jobs use **higher** priority when the queue is busy.`,
    'Use `POST /subscription/subscribe` and `POST /subscription/cancel` to toggle tier.',
    '',
    '## Prompt simulation lifecycle',
    '1. `POST /prompts` creates a **PENDING** prompt (HTTP response includes a `queue` stub; the row is not yet in BullMQ).',
    '2. A **cron** job (every **30s**) discovers **PENDING** prompts and enqueues **BullMQ** generation jobs (deduped by `promptId`).',
    '3. The **worker** sets status **PROCESSING**, waits **3–7s** (simulated model latency), creates an **audio** row, sets **COMPLETED**, and emits Socket.IO **`prompt.completed`** to room `user:{userId}`.',
    '4. On failure after **PROCESSING** started, status is reset to **PENDING** for retry.',
    '',
    '### Realtime (not REST — documented here for operators)',
    'Connect to the default Socket.IO namespace with the **access** JWT in `handshake.auth.token` or `Authorization: Bearer <access>`.',
    'Event: **`prompt.completed`** payload `{ promptId, audioId, audioUrl }`.',
    '',
    '## Error responses',
    'Errors return JSON `{ statusCode, message, error? }` as **HttpErrorResponseDto**.',
    '- **400** — bad input (e.g. duplicate email on register); validation errors use `message: string[]`.',
    '- **401** — missing/invalid access JWT, or failed login.',
    '- **403** — forbidden (e.g. refresh mismatch, or updating another user’s profile).',
    '- **404** — entity not found.',
    '- **429** — shared subscription rate limit exceeded; check **Retry-After** (seconds until the next window).',
    '- **503** — Redis/rate-limit store unavailable (**fail closed** on guarded routes).',
  ].join('\n');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MusicGPT API')
    .setDescription(swaggerDescription)
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Use the **refresh** JWT here (not the access token).',
      },
      'refresh',
    )
    .addTag('auth', 'Register, login, refresh, logout')
    .addTag('users', 'User listing and profile (access JWT + rate limit)')
    .addTag('prompts', 'Create prompts; background simulation + WebSocket completion')
    .addTag('subscription', 'Toggle FREE / PAID tier')
    .addTag('audio', 'List and update generated audio')
    .addTag('search', 'Unified ranked search over users and audio')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [HttpErrorResponseDto],
  });

  const swaggerOptions = { customSiteTitle: 'MusicGPT API docs' };

  SwaggerModule.setup('docs', app, document, swaggerOptions);
  SwaggerModule.setup('api/docs', app, document, swaggerOptions);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
