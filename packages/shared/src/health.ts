/** Response of `GET /api/health`. */
export interface HealthResponse {
  status: 'ok';
  /** Result of a `SELECT 1` on the database. */
  database: 'up' | 'down';
  /** ISO 8601 date of the response. */
  timestamp: string;
}
