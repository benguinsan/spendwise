#!/bin/sh
set -e

echo "🔄 Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL
max_attempts=30
attempt=0

until echo "SELECT 1" | npx prisma db execute --stdin > /dev/null 2>&1 || [ $attempt -eq $max_attempts ]; do
  attempt=$((attempt + 1))
  echo "⏳ Attempt $attempt/$max_attempts: PostgreSQL is unavailable - waiting..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ PostgreSQL did not become ready in time"
  exit 1
fi

echo "✅ PostgreSQL is ready!"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy
echo "✅ Migrations completed!"

# Start the application
echo "🚀 Starting NestJS application..."
exec node dist/src/main.js
