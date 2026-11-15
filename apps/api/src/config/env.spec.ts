import { validateEnv } from './env.js';

describe('validateEnv', () => {
  it('returns the variables when DATABASE_URL is a PostgreSQL URL', () => {
    const url = 'postgresql://u:p@localhost:5433/db';
    expect(validateEnv({ DATABASE_URL: url, OTHER: 'x' })).toEqual({ DATABASE_URL: url });
  });

  it('accepts the postgres:// scheme', () => {
    expect(() => validateEnv({ DATABASE_URL: 'postgres://u:p@localhost/db' })).not.toThrow();
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('throws when DATABASE_URL is not a PostgreSQL URL', () => {
    expect(() => validateEnv({ DATABASE_URL: 'mysql://u:p@localhost/db' })).toThrow(/DATABASE_URL/);
    expect(() => validateEnv({ DATABASE_URL: 'not a url' })).toThrow(/DATABASE_URL/);
  });
});
