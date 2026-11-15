import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import type { CurrentUser } from '@espace-client/shared';
import type { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { UsersService } from '../../src/users/users.service.js';
import { resetDatabase } from './reset-database.js';

export interface AuthTestApp {
  app: INestApplication<App>;
  prisma: PrismaService;
  /** Creates an account whose password is hashed by the app's own hasher. */
  createUser(email: string, password: string): Promise<CurrentUser>;
}

/**
 * The whole application on an emptied test database, with a cheap password hasher
 * (`logN: 10` unless given) so that signing in stays fast.
 */
export async function createAuthTestApp(options?: { logN?: number }): Promise<AuthTestApp> {
  const hasher = new PasswordHasher({ logN: options?.logN ?? 10 });
  const moduleFixture = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PasswordHasher)
    .useValue(hasher)
    .compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  configureApp(app);
  await app.init();

  const prisma = app.get(PrismaService);
  await resetDatabase(prisma);

  const users = app.get(UsersService);
  return {
    app,
    prisma,
    createUser: async (email, password) => users.create(email, await hasher.hash(password)),
  };
}
