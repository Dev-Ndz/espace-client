import type { Routes } from '@angular/router';
import { redirectIfSignedIn, requireSignedIn } from './auth/auth-guards';
import { HomePage } from './home/home-page';

export const routes: Routes = [
  {
    path: 'connexion',
    canActivate: [redirectIfSignedIn],
    loadComponent: () => import('./sign-in/sign-in-page').then((m) => m.SignInPage),
  },
  { path: '', canActivate: [requireSignedIn], component: HomePage },
  { path: '**', redirectTo: '' },
];
