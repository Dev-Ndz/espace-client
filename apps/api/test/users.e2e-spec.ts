import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '../src/config/env.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { EmailTakenError, UsersService } from '../src/users/users.service.js';
import { UsersModule } from '../src/users/users.module.js';
import { resetDatabase } from './support/reset-database.js';

describe('UsersService (e2e)', () => {
  let moduleRef: TestingModule;
  let users: UsersService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        PrismaModule,
        UsersModule,
      ],
    }).compile();
    await moduleRef.init();
    users = moduleRef.get(UsersService);
  });

  beforeEach(async () => {
    await resetDatabase(moduleRef.get(PrismaService));
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('create normalizes the email and does not return the password hash', async () => {
    const user = await users.create('  Ada@Example.com ', 'hash');
    expect(user).toEqual({ id: expect.any(String), email: 'ada@example.com' });
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('create rejects a duplicate email, whatever its case', async () => {
    await users.create('ada@example.com', 'hash');
    await expect(users.create('ADA@example.com', 'other')).rejects.toBeInstanceOf(EmailTakenError);
  });

  it('findCredentials returns the user and its hash, and null for an unknown email', async () => {
    const created = await users.create('ada@example.com', 'hash');
    await expect(users.findCredentials(' ADA@example.com')).resolves.toEqual({
      user: { id: created.id, email: 'ada@example.com' },
      passwordHash: 'hash',
    });
    await expect(users.findCredentials('nobody@example.com')).resolves.toBeNull();
  });

  it('findById returns the user, and null for an unknown id', async () => {
    const created = await users.create('ada@example.com', 'hash');
    await expect(users.findById(created.id)).resolves.toEqual({
      id: created.id,
      email: 'ada@example.com',
    });
    await expect(users.findById('unknown')).resolves.toBeNull();
  });

  it('updatePasswordHash replaces the stored hash', async () => {
    const created = await users.create('ada@example.com', 'hash');
    await users.updatePasswordHash(created.id, 'new');
    const credentials = await users.findCredentials('ada@example.com');
    expect(credentials?.passwordHash).toBe('new');
  });
});
