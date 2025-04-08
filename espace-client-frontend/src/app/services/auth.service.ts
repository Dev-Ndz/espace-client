import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrlLogin = environment.apiUrl + '/auth/login';
  private APIURL_LOGOUT = environment.apiUrl + '/auth/logout';
  private apiUrlRegister = environment.apiUrl + '/auth/register';
  private apiUrlForgotPasword = environment.apiUrl + '/auth/forgotPassword';

  private http = inject(HttpClient);

  login(email: string, password: string): Observable<string> {
    const loginData = { email, password };
    return this.http.post<string>(this.apiUrlLogin, loginData);
  }

  logout() {
    return this.http.get(this.APIURL_LOGOUT);
  }

  forgotPassword(email: string) {
    const mail = email;
    return mail;
    // const forgotPassswordData = { email };
    // return this.http.post<ForgotPasswordResponse>(
    //   this.apiUrlForgotPasword,
    //   forgotPassswordData,
    //   {
    //     headers: { 'Content-Type': 'application/json' },
    //   }
    // );
  }

  register(email: string, password: string, token: string) {
    return this.http.post(
      this.apiUrlRegister,
      { email, password },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      }
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.http
      .get<boolean>(environment.apiUrl + '/auth/isAuthenticated')
      .pipe(
        map((isAuthenticated) => {
          return isAuthenticated;
        }),
        catchError((err) => {
          console.error(err);
          return of(false);
        })
      );
  }
  isAdmin(): Observable<boolean> {
    return this.http.get<boolean>(environment.apiUrl + '/auth/isAdmin').pipe(
      map((isAuthenticated) => {
        return isAuthenticated;
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      })
    );
  }
}
