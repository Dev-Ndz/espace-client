import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Database used by the e2e tests', () => {
  it('is a _test database, never the development one', async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const prisma = moduleFixture.get(PrismaService);
    try {
      const [row] = await prisma.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`;
      expect(row?.name).toMatch(/_test$/);
    } finally {
      await moduleFixture.close();
    }
  });
});
