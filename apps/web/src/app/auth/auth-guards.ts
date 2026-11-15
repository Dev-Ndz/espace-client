import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthSession } from './auth-session';

export const requireSignedIn: CanActivateFn = async (_route, state) => {
  const session = inject(AuthSession);
  const router = inject(Router);
  const user = session.user() ?? (await session.refresh());
  return user ? true : router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
};

export const redirectIfSignedIn: CanActivateFn = async () => {
  const session = inject(AuthSession);
  const router = inject(Router);
  const user = session.user() ?? (await session.refresh());
  return user ? router.createUrlTree(['/']) : true;
};
