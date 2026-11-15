import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Variables already set in the environment win over .env (the e2e setup relies on it).
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
