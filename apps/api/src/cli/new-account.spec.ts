import { MIN_PASSWORD_LENGTH, validateNewAccount } from './new-account.js';

const valid = {
  email: 'ada@example.com',
  password: 'x'.repeat(12),
  confirmation: 'x'.repeat(12),
};

describe('validateNewAccount', () => {
  it('accepts a valid account', () => {
    expect(validateNewAccount(valid)).toEqual([]);
  });

  it('rejects an invalid email', () => {
    expect(validateNewAccount({ ...valid, email: 'not-an-email' })).toContain(
      'Invalid email address.',
    );
  });

  it('validates the normalized email', () => {
    expect(validateNewAccount({ ...valid, email: '  Ada@Example.COM ' })).toEqual([]);
  });

  it('rejects a password shorter than the minimum', () => {
    const short = 'x'.repeat(MIN_PASSWORD_LENGTH - 1);
    expect(validateNewAccount({ ...valid, password: short, confirmation: short })).toContain(
      'The password must be at least 12 characters long.',
    );
  });

  it('counts characters, not UTF-16 units', () => {
    const emoji = '😀'.repeat(12);
    expect(validateNewAccount({ ...valid, password: emoji, confirmation: emoji })).toEqual([]);
  });

  it('rejects a different confirmation', () => {
    expect(validateNewAccount({ ...valid, confirmation: 'y'.repeat(12) })).toContain(
      'The two passwords differ.',
    );
  });

  it('reports every problem at once', () => {
    expect(validateNewAccount({ email: 'nope', password: 'short', confirmation: 'other' })).toEqual(
      [
        'Invalid email address.',
        'The password must be at least 12 characters long.',
        'The two passwords differ.',
      ],
    );
  });
});
