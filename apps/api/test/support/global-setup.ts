import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import type { TestProject } from 'vitest/node';
import { resolveTestDatabaseUrl } from './test-database-url.js';

/** Brings the test database to the latest schema, then hands its URL to the e2e tests. */
export default function setup(project: TestProject): void {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }
  const testDatabaseUrl = resolveTestDatabaseUrl(process.env);
  // A fixed command string run through the shell, so the pnpm shim also resolves on Windows.
  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
  });
  project.provide('testDatabaseUrl', testDatabaseUrl);
}

declare module 'vitest' {
  export interface ProvidedContext {
    testDatabaseUrl: string;
  }
}
