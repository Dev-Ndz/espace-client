import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@espace-client/shared';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Always answers 200: the body says whether the database responds. */
  @Get()
  async getHealth(): Promise<HealthResponse> {
    return {
      status: 'ok',
      database: (await this.isDatabaseUp()) ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }

  private async isDatabaseUp(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
