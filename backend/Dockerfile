FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start:dev"]
