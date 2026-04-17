#!/bin/sh
set -e

# Waits for DB/Redis are handled by docker-compose depends_on + healthchecks.
echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Loading sample data (idempotent)..."
node scripts/seed-sample-data.js

echo "Starting Nest API on port ${PORT:-5001}..."
exec node dist/src/main.js
