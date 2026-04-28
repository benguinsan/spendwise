FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma

# Build project
COPY . .
RUN npm run build

# Expose port
EXPOSE 5000

# Run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]