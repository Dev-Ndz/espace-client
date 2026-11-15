import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  // HttpClient uses fetch by default (withFetch is deprecated). provideHttpClient()
  // remains the place to register future interceptors.
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
};
