import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { PoolConfig } from 'pg';
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }

    const parsedUrl = new URL(databaseUrl);
    const sslmode = parsedUrl.searchParams.get('sslmode');
    const schema = parsedUrl.searchParams.get('schema') ?? undefined;

    const poolConfig: PoolConfig = {
      connectionString: databaseUrl,
    };

    // Prisma adapter-pg uses node-postgres under the hood.
    // For AWS RDS dev environments with self-signed chain, map sslmode=no-verify
    // to pg SSL config explicitly.
    if (sslmode === 'no-verify') {
      poolConfig.ssl = { rejectUnauthorized: false };
    }

    const adapter = new PrismaPg(poolConfig, { schema });
    super({ adapter });
  }
}
