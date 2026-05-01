FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN DATABASE_URL="postgresql://appuser:password@localhost:5432/dummy?schema=public" \
    npx prisma generate --schema=./prisma/schema.prisma

# Copy source code
COPY . .

# Build project
RUN npm run build

# Make startup script executable
RUN chmod +x /app/start.sh

EXPOSE 5000

CMD ["sh", "/app/start.sh"]