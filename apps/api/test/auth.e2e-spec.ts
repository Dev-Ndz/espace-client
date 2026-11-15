import type { INestApplication } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import type { CurrentUser } from '@espace-client/shared';
import request from 'supertest';
import type { Response } from 'supertest';
import type { App } from 'supertest/types.js';
import type { PrismaService } from '../src/prisma/prisma.service.js';
import { UsersService } from '../src/users/users.service.js';
import { createAuthTestApp } from './support/auth-test-app.js';

const EMAIL = 'ada@example.com';
const PASSWORD = 'correct horse battery';
const DAY_MS = 24 * 60 * 60 * 1000;
const CROSS_SITE = { Origin: 'https://evil.example', 'Sec-Fetch-Site': 'cross-site' };

/** The `name=value` part of the first `Set-Cookie` header. */
function cookieOf(res: Response): string {
  return setCookies(res)[0]!.split(';')[0]!;
}

function setCookies(res: Response): string[] {
  const header = res.headers['set-cookie'] as string[] | string | undefined;
  return header === undefined ? [] : ([] as string[]).concat(header);
}

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ada: CurrentUser;

  beforeEach(async () => {
    const testApp = await createAuthTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    ada = await testApp.createUser(EMAIL, PASSWORD);
  });

  afterEach(async () => {
    await app.close();
  });

  const signIn = (body: unknown, headers: Record<string, string> = {}) =>
    request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .set(headers)
      .send(body as object);

  const me = (cookie?: string) => {
    const req = request(app.getHttpServer()).get('/api/auth/me');
    return cookie === undefined ? req : req.set('Cookie', cookie);
  };

  const sessionCount = () => prisma.session.count({ where: { userId: ada.id } });

  it('signs in: returns the user, sets the session cookie and stores the session', async () => {
    const res = await signIn({ email: EMAIL, password: PASSWORD }).expect(200);

    expect(res.body).toEqual({ id: ada.id, email: EMAIL });
    expect(res.body).not.toHaveProperty('passwordHash');
    const cookie = setCookies(res)[0]!;
    expect(cookie.startsWith('__Host-sid=')).toBe(true);
    for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', 'Max-Age=7776000']) {
      expect(cookie).toContain(attribute);
    }
    expect(await sessionCount()).toBe(1);
  });

  it('signs in with the email typed differently', async () => {
    await signIn({ email: ' Ada@Example.COM ', password: PASSWORD }).expect(200);
  });

  it('GET /api/auth/me returns the signed-in user', async () => {
    const cookie = cookieOf(await signIn({ email: EMAIL, password: PASSWORD }).expect(200));

    const res = await me(cookie).expect(200);

    expect(res.body).toEqual({ id: ada.id, email: EMAIL });
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('answers a wrong password and an unknown email with the same 401', async () => {
    const wrongPassword = await signIn({ email: EMAIL, password: 'wrong password' }).expect(401);
    const unknownEmail = await signIn({ email: 'nobody@example.com', password: PASSWORD }).expect(
      401,
    );

    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });

  it('answers 400 to a body without two strings', async () => {
    await signIn({ email: 42, password: 'x' }).expect(400);
    await signIn({ email: EMAIL }).expect(400);
  });

  it('answers 401 to a password of 5000 characters', async () => {
    await signIn({ email: EMAIL, password: 'a'.repeat(5000) }).expect(401);
  });

  it('protects a route without a session cookie or with an unknown one', async () => {
    await me().expect(401);
    await me('__Host-sid=unknown').expect(401);
  });

  it('refuses a session past its absolute expiry', async () => {
    const cookie = cookieOf(await signIn({ email: EMAIL, password: PASSWORD }).expect(200));
    await prisma.session.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });

    await me(cookie).expect(401);
  });

  it('refuses a session idle for more than 30 days', async () => {
    const cookie = cookieOf(await signIn({ email: EMAIL, password: PASSWORD }).expect(200));
    await prisma.session.updateMany({ data: { lastActiveAt: new Date(Date.now() - 31 * DAY_MS) } });

    await me(cookie).expect(401);
  });

  it('keeps GET /api/health public', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
  });

  it('signs out: deletes the session and clears the cookie', async () => {
    const cookie = cookieOf(await signIn({ email: EMAIL, password: PASSWORD }).expect(200));

    const res = await request(app.getHttpServer())
      .post('/api/auth/sign-out')
      .set('Cookie', cookie)
      .expect(204);

    expect(await sessionCount()).toBe(0);
    await me(cookie).expect(401);
    const cleared = setCookies(res).find((c) => c.startsWith('__Host-sid='));
    expect(cleared).toContain('Max-Age=0');
  });

  it('answers 401 to a sign-out without a session', async () => {
    await request(app.getHttpServer()).post('/api/auth/sign-out').expect(401);
  });

  it('replaces the previous session when signing in again', async () => {
    const first = cookieOf(await signIn({ email: EMAIL, password: PASSWORD }).expect(200));
    const second = cookieOf(
      await signIn({ email: EMAIL, password: PASSWORD }, { Cookie: first }).expect(200),
    );

    await me(first).expect(401);
    await me(second).expect(200);
    expect(await sessionCount()).toBe(1);
  });

  it('refuses a sign-in from another site', async () => {
    await signIn({ email: EMAIL, password: PASSWORD }, CROSS_SITE).expect(403);

    expect(await sessionCount()).toBe(0);
  });

  it('does not sign out from another site', async () => {
    const cookie = cookieOf(await signIn({ email: EMAIL, password: PASSWORD }).expect(200));

    const res = await request(app.getHttpServer())
      .post('/api/auth/sign-out')
      .set({ ...CROSS_SITE, Cookie: cookie });

    expect(res.status).not.toBe(204);
    expect(await sessionCount()).toBe(1);
  });

  it('ends the session of a deleted user', async () => {
    const cookie = cookieOf(await signIn({ email: EMAIL, password: PASSWORD }).expect(200));
    await prisma.user.deleteMany();

    await me(cookie).expect(401);
  });
});

describe('Authentication (e2e), password rehash', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeEach(async () => {
    ({ app, prisma } = await createAuthTestApp({ logN: 11 }));
  });

  afterEach(async () => {
    await app.close();
  });

  it('replaces a hash made with older parameters after a successful sign-in', async () => {
    const oldHash = await new PasswordHasher({ logN: 10 }).hash(PASSWORD);
    const user = await app.get(UsersService).create(EMAIL, oldHash);

    await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({ email: EMAIL, password: PASSWORD })
      .expect(200);

    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(stored.passwordHash).not.toBe(oldHash);
  });
});
