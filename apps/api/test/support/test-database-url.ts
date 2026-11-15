/**
 * URL of the database the e2e tests run against. Refuses any database whose name does not end
 * with `_test`, so a copy-paste mistake cannot wipe the development database.
 */
export function resolveTestDatabaseUrl(env: Record<string, string | undefined>): string {
  const url = env['TEST_DATABASE_URL'];
  if (!url) {
    throw new Error('TEST_DATABASE_URL is missing (see apps/api/.env.example).');
  }
  if (!URL.canParse(url)) {
    throw new Error('TEST_DATABASE_URL is not a valid URL.');
  }
  const databaseName = new URL(url).pathname.replace(/^\//, '');
  if (!databaseName.endsWith('_test')) {
    throw new Error(
      `TEST_DATABASE_URL must point at a database whose name ends with _test (got "${databaseName}").`,
    );
  }
  return url;
}
