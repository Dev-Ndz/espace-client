import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  // HttpClient utilise fetch par défaut (withFetch est déprécié). provideHttpClient()
  // reste l'endroit où brancher les futurs intercepteurs.
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
};
