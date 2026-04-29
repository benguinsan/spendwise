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
    const sslmode = (parsedUrl.searchParams.get('sslmode') ?? '').toLowerCase();
    const schema = parsedUrl.searchParams.get('schema') ?? undefined;

    const poolConfig: PoolConfig = {
      connectionString: databaseUrl,
    };

    // Prisma adapter-pg uses node-postgres under the hood.
    // Explicitly map sslmode to pg SSL behavior so local Docker and RDS both work:
    // - sslmode=disable   -> plain TCP (local docker postgres default)
    // - sslmode=require   -> TLS + cert verification
    // - sslmode=no-verify -> TLS without CA verification (RDS dev shortcut)
    switch (sslmode) {
      case 'disable':
        poolConfig.ssl = false;
        break;
      case 'require':
      case 'verify-ca':
      case 'verify-full':
        poolConfig.ssl = true;
        break;
      case 'no-verify':
        poolConfig.ssl = { rejectUnauthorized: false };
        break;
      default:
        // No sslmode in URL -> leave pg default behavior.
        break;
    }

    const adapter = new PrismaPg(poolConfig, { schema });
    super({ adapter });
  }
}
