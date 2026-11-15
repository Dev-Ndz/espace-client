import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PasswordHasher } from '@nestjs/authentication';
import { validateEnv } from '../config/env.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersModule } from '../users/users.module.js';

/** Dependencies of the command-line tools: no HTTP server, no session handling. */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    UsersModule,
  ],
  // Default cost, the same as the API's `AuthenticationModule`.
  providers: [{ provide: PasswordHasher, useValue: new PasswordHasher() }],
})
export class CliModule {}
