/** Réponse de `GET /api/health`. */
export interface HealthResponse {
  status: 'ok';
  /** Date ISO 8601 de la réponse. */
  timestamp: string;
}
