import { resolveTestDatabaseUrl } from './test-database-url.js';

describe('resolveTestDatabaseUrl', () => {
  const base = 'postgresql://u:p@localhost:5433/';

  it('returns TEST_DATABASE_URL when the database name ends with _test', () => {
    expect(resolveTestDatabaseUrl({ TEST_DATABASE_URL: `${base}espace_client_test` })).toBe(
      `${base}espace_client_test`,
    );
  });

  it('refuses a database whose name does not end with _test', () => {
    expect(() => resolveTestDatabaseUrl({ TEST_DATABASE_URL: `${base}espace_client` })).toThrow(
      /_test/,
    );
  });

  it('refuses a missing TEST_DATABASE_URL', () => {
    expect(() => resolveTestDatabaseUrl({})).toThrow(/TEST_DATABASE_URL/);
  });

  it('ignores query parameters when reading the database name', () => {
    expect(() =>
      resolveTestDatabaseUrl({ TEST_DATABASE_URL: `${base}espace_client?x=_test` }),
    ).toThrow(/_test/);
  });
});
