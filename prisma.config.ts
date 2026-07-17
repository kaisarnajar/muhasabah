import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import path from 'path';

// Load .env explicitly for the Prisma CLI
config({ path: path.resolve(process.cwd(), '.env') });

// In serverless build environments (like Vercel), environment variables may not be
// exposed during the npm install (postinstall) phase. We use a dummy fallback URL
// to allow 'prisma generate' to succeed without crashing the installation.
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

export default defineConfig({
  datasource: {
    url: dbUrl,
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});
