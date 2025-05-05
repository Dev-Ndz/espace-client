import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn =
  (/*route, state*/): Observable<boolean> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // est ceque ça fonctionnerait tout seul comme ça ?
    // return authService.isAuthenticated()
    return authService.isAuthenticated().pipe(
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          router.navigate(['/auth/login']);
          return false;
        }
        return true;
      })
    );
  };
