import { Injectable } from '@nestjs/common';
import { AuthenticationStorage } from '@nestjs/authentication';
import type { MfaState, SessionRecord, SessionStore } from '@nestjs/authentication';
import { Prisma } from '../generated/prisma/client.js';
import type { Session } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** Sessions of `@nestjs/authentication`, stored in the `Session` table. */
@Injectable()
export class PrismaSessionStore implements SessionStore {
  constructor(
    private readonly prisma: PrismaService,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({ sessions: this });
  }

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const row = await this.prisma.session.findUnique({ where: { id } });
    return row ? toRecord(row) : undefined;
  }

  async createSession(record: SessionRecord): Promise<void> {
    await this.prisma.session.create({
      data: {
        id: record.id,
        userId: record.userId,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        lastActiveAt: record.lastActiveAt,
        mfa: record.mfa ?? null,
        metadata: record.metadata ? (record.metadata as Prisma.InputJsonObject) : Prisma.DbNull,
      },
    });
    // Keeps the table bounded: sessions already expired when this one was created are dead.
    await this.prisma.session.deleteMany({ where: { expiresAt: { lte: record.createdAt } } });
  }

  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    // One conditional write: only forward, and never resurrects a deleted session.
    await this.prisma.session.updateMany({
      where: { id, lastActiveAt: { lt: lastActiveAt } },
      data: { lastActiveAt },
    });
  }

  async deleteSession(id: string): Promise<boolean> {
    const { count } = await this.prisma.session.deleteMany({ where: { id } });
    return count > 0;
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const rows = await this.prisma.session.findMany({ where: { userId } });
    return rows.map(toRecord);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }
}

/** Optional fields come back absent, never `null`. */
function toRecord(row: Session): SessionRecord {
  const record: SessionRecord = {
    id: row.id,
    userId: row.userId,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    lastActiveAt: row.lastActiveAt,
  };
  if (row.mfa !== null) record.mfa = row.mfa as MfaState;
  if (row.metadata !== null) record.metadata = row.metadata as Record<string, unknown>;
  return record;
}
