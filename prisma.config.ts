import { defineConfig, env } from 'prisma/config';
import { config } from 'dotenv';
import path from 'path';

// Load .env explicitly for the Prisma CLI
config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  datasource: {
    url: env("DIRECT_URL") || env("DATABASE_URL"),
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});
