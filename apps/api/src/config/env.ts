/** Environment variables the API needs, validated at startup. */
export interface Env {
  DATABASE_URL: string;
}

const POSTGRES_PROTOCOLS = new Set(['postgresql:', 'postgres:']);

/**
 * `validate` function for `ConfigModule.forRoot`: the API refuses to start when a variable is
 * missing or invalid. Returns only the known variables.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const url = config['DATABASE_URL'];
  if (typeof url !== 'string' || url === '') {
    throw new Error('DATABASE_URL is missing (see apps/api/.env.example).');
  }
  if (!URL.canParse(url) || !POSTGRES_PROTOCOLS.has(new URL(url).protocol)) {
    throw new Error('DATABASE_URL must be a postgresql:// URL.');
  }
  return { DATABASE_URL: url };
}
