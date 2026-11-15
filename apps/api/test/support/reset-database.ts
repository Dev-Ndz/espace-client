import type { PrismaService } from '../../src/prisma/prisma.service.js';

/** Empties the tables of the test database, so each test starts from a clean state. */
export async function resetDatabase(prisma: PrismaService): Promise<void> {
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}
