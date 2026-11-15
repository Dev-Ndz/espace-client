import { BadRequestException } from '@nestjs/common';
import { parseSignInBody } from './sign-in-body.js';

describe('parseSignInBody', () => {
  it('returns the email and password unchanged', () => {
    expect(parseSignInBody({ email: 'a@b.c', password: 'secret' })).toEqual({
      email: 'a@b.c',
      password: 'secret',
    });
  });

  it.each([
    ['no body', undefined],
    ['a string', 'text'],
    ['an empty object', {}],
    ['an email that is not a string', { email: 42, password: 'x' }],
    ['a missing password', { email: 'a@b.c' }],
    ['an empty email', { email: '', password: 'x' }],
    ['an empty password', { email: 'a@b.c', password: '' }],
  ])('refuses %s', (_case, body) => {
    expect(() => parseSignInBody(body)).toThrow(BadRequestException);
  });
});
