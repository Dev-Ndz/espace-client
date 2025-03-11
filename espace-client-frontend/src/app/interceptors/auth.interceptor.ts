import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const reqWithCredientials = req.clone({
    withCredentials: true,
  });
  console.log('intercepting...');
  return next(reqWithCredientials);
};
