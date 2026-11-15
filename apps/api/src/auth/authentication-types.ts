import type { CurrentUser } from '@espace-client/shared';

// Types `@CurrentUser()`, `AuthenticationContext.user` and `@CurrentUser('key')` app-wide.
declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: CurrentUser;
  }
}
