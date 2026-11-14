import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@espace-client/shared';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
