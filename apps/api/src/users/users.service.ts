import { Injectable } from '@nestjs/common';
import type { CurrentUser } from '@espace-client/shared';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizeEmail } from './email.js';

/** Thrown by `UsersService.create` when an account already uses the email. */
export class EmailTakenError extends Error {
  constructor() {
    super('This email is already used by an account.');
    this.name = 'EmailTakenError';
  }
}

const publicFields = { id: true, email: true } as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<CurrentUser | null> {
    return this.prisma.user.findUnique({ where: { id }, select: publicFields });
  }

  async findCredentials(
    email: string,
  ): Promise<{ user: CurrentUser; passwordHash: string } | null> {
    const found = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: { ...publicFields, passwordHash: true },
    });
    if (!found) {
      return null;
    }
    const { passwordHash, ...user } = found;
    return { user, passwordHash };
  }

  async create(email: string, passwordHash: string): Promise<CurrentUser> {
    try {
      return await this.prisma.user.create({
        data: { email: normalizeEmail(email), passwordHash },
        select: publicFields,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new EmailTakenError();
      }
      throw error;
    }
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }
}
