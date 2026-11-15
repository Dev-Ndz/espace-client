import type { INestApplication } from '@nestjs/common';

/** Configuration shared by the real application and the e2e tests. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  // Refuses (403) any state-changing request sent from another site's page.
  app.enableCsrfProtection();
}
