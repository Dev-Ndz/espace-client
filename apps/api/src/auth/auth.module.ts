import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { CredentialsService } from './credentials.service.js';
import { PrismaSessionStore } from './prisma-session.store.js';
import { SessionAuth } from './session-auth.js';

@Module({
  imports: [UsersModule],
  providers: [PrismaSessionStore, SessionAuth, CredentialsService],
  controllers: [AuthController],
})
export class AuthModule {}
