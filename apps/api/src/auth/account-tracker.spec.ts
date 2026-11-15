import { accountTracker } from './account-tracker.js';

describe('accountTracker', () => {
  it('gives the same key for the same account whatever the email spelling', () => {
    expect(accountTracker({ body: { email: ' Ada@Example.com ' }, ip: '1.2.3.4' })).toBe(
      accountTracker({ body: { email: 'ada@example.com' }, ip: '1.2.3.4' }),
    );
  });

  it('gives a different key for the same email from another IP', () => {
    expect(accountTracker({ body: { email: 'ada@example.com' }, ip: '1.2.3.4' })).not.toBe(
      accountTracker({ body: { email: 'ada@example.com' }, ip: '5.6.7.8' }),
    );
  });

  it('does not throw when the email is not a string or the body is missing', () => {
    expect(() => accountTracker({ body: { email: 42 }, ip: '1.2.3.4' })).not.toThrow();
    expect(() => accountTracker({ ip: '1.2.3.4' })).not.toThrow();
  });
});
