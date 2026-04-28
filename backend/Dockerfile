FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Cài deps
COPY package*.json ./
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client (set dummy DATABASE_URL for build phase)
RUN DATABASE_URL="postgresql://user:password@localhost:5432/dummy" npx prisma generate

# Copy source code
COPY . .

# Build project
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/src/main.js"]