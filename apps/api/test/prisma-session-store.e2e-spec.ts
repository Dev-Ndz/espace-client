import { authenticationStoreContract } from '@nestjs/authentication/testing';
import { inject } from 'vitest';
import { PrismaSessionStore } from '../src/auth/prisma-session.store.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const prisma = new PrismaService({ get: () => inject('testDatabaseUrl') } as never);

afterAll(async () => {
  await prisma.$disconnect();
});

// The contract suite uses unique ids per case, so the table is not reset between cases.
const cases = authenticationStoreContract(
  () => ({ sessions: new PrismaSessionStore(prisma, { registerSource: vi.fn() } as never) }),
  { contracts: ['sessions'], concurrent: true },
);

for (const c of cases) {
  it(c.name, () => c.run());
}
