FROM node:20-alpine

WORKDIR /app

# Install dependencies with reproducible installs
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]
