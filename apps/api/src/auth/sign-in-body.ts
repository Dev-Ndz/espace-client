import { BadRequestException } from '@nestjs/common';
import type { SignInRequest } from '@espace-client/shared';

/** Checks the body of `POST /api/auth/sign-in`: an email and a password, both non-empty strings. */
export function parseSignInBody(body: unknown): SignInRequest {
  if (typeof body === 'object' && body !== null) {
    const { email, password } = body as Record<string, unknown>;
    if (isFilledString(email) && isFilledString(password)) {
      return { email, password };
    }
  }
  throw new BadRequestException('An email and a password are required.');
}

function isFilledString(value: unknown): value is string {
  return typeof value === 'string' && value !== '';
}
