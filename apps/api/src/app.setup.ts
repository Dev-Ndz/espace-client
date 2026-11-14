import type { INestApplication } from '@nestjs/common';

/** Configuration commune à l'application réelle et aux tests e2e. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
}
