# --- Build stage: install deps, generate Prisma client, compile Nest ---
FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY infrastructure ./infrastructure
COPY src ./src
COPY scripts ./scripts

RUN npm ci

RUN npx prisma generate
RUN npm run build

# --- Runtime image: reuse node_modules from builder (includes prisma CLI for migrate deploy) ---
FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/infrastructure ./infrastructure
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/scripts ./scripts

COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5001

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
