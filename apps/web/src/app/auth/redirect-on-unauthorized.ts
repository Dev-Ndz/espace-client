import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthSession } from './auth-session';

// These endpoints answer 401 as part of normal operation (sign-out handles it itself).
const EXEMPT_URLS = ['/api/auth/sign-in', '/api/auth/me', '/api/auth/sign-out'];

/** On a 401 from the API, forgets the session and sends the user to the sign-in page. */
export const redirectOnUnauthorized: HttpInterceptorFn = (req, next) => {
  const session = inject(AuthSession);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !EXEMPT_URLS.includes(req.url)
      ) {
        session.clear();
        void router.navigate(['/connexion'], { queryParams: { retour: router.url } });
      }
      return throwError(() => error);
    }),
  );
};
