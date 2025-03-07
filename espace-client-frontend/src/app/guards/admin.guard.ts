import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn =
  (/*route, state*/): Observable<boolean> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // est ceque ça fonctionnerait tout seul comme ça ?
    // return authService.isAuthenticated()
    return authService.isAdmin().pipe(
      map((isAdmin) => {
        if (!isAdmin) {
          console.log('user is not an admin, redirect to user/home');
          router.navigate(['user/home']);
          return false;
        }
        console.log('user is admin');
        return true;
      })
    );
  };
