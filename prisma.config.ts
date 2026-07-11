import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';
import path from 'path';

// Load .env explicitly for the Prisma CLI
config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});
