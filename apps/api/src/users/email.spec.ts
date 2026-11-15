import { normalizeEmail } from './email.js';

describe('normalizeEmail', () => {
  it('trims and lower-cases', () => {
    expect(normalizeEmail('  Ada@Example.COM ')).toBe('ada@example.com');
  });

  it('normalizes to NFC', () => {
    expect(normalizeEmail('e\u0301lise@example.com')).toBe('\u00e9lise@example.com');
  });

  it('leaves a clean address untouched', () => {
    expect(normalizeEmail('ada@example.com')).toBe('ada@example.com');
  });
});
