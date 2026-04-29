FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client after the schema exists in the image.
# Without this, the @prisma/client postinstall can run before ./prisma is present,
# producing a client without delegates (e.g. prisma.user, prisma.wallet, $transaction).
RUN DATABASE_URL="postgresql://appuser:password@localhost:5432/dummy?sslmode=no-verify&schema=public" npx prisma generate --schema=./prisma/schema.prisma

# Build project
COPY . .
RUN npm run build

# Expose port
EXPOSE 5000

# Run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]