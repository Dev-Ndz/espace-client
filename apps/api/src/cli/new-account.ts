import { normalizeEmail } from '../users/email.js';

export const MIN_PASSWORD_LENGTH = 12;

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks the input of the `user:create` command. Returns the problems, empty when valid. */
export function validateNewAccount(input: {
  email: string;
  password: string;
  confirmation: string;
}): string[] {
  const problems: string[] = [];
  if (!EMAIL_SHAPE.test(normalizeEmail(input.email))) {
    problems.push('Invalid email address.');
  }
  // Count characters (code points), not UTF-16 units.
  if ([...input.password].length < MIN_PASSWORD_LENGTH) {
    problems.push(`The password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }
  if (input.password !== input.confirmation) {
    problems.push('The two passwords differ.');
  }
  return problems;
}
