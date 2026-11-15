/** Response of `GET /api/health`. */
export interface HealthResponse {
  status: 'ok';
  /** ISO 8601 date of the response. */
  timestamp: string;
}
