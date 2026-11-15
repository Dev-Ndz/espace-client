/** Canonical form of an email address: trimmed, NFC, lower-cased. Used for storage and lookups. */
export function normalizeEmail(raw: string): string {
  return raw.trim().normalize('NFC').toLowerCase();
}
