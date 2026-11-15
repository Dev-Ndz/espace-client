import { normalizeIp } from '@nestjs/throttler';
import { normalizeEmail } from '../users/email.js';

/**
 * Throttler key of one account attacked from one address: `email|ip`.
 * A body without a string email (rejected later by validation) falls back to the IP alone.
 */
export function accountTracker(req: { body?: unknown; ip?: string }): string {
  const ip = normalizeIp(req.ip ?? '');
  const email = (req.body as { email?: unknown } | undefined)?.email;
  return `${typeof email === 'string' ? normalizeEmail(email) : ''}|${ip}`;
}
