import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '@nestjs/authentication';
import { AuthModule } from './auth/auth.module.js';
import { validateEnv } from './config/env.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  // ConfigModule reads apps/api/.env (process cwd); variables already in the environment win.
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    // Every route needs a session unless marked `@Public()`.
    AuthenticationModule.forRoot({ session: { idleTtl: '30d', absoluteTtl: '90d' } }),
    PrismaModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
