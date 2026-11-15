import { inject } from 'vitest';

// Runs before each e2e file: the API under test uses the test database, never the dev one.
process.env['DATABASE_URL'] = inject('testDatabaseUrl');
