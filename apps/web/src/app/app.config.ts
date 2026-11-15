import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { redirectOnUnauthorized } from './auth/redirect-on-unauthorized';

export const appConfig: ApplicationConfig = {
  // HttpClient uses fetch by default (withFetch is deprecated).
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([redirectOnUnauthorized])),
  ],
};
