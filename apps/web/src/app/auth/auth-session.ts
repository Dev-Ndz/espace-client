import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import type { CurrentUser, SignInRequest } from '@espace-client/shared';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly http = inject(HttpClient);
  private readonly current = signal<CurrentUser | null>(null);

  readonly user = this.current.asReadonly();

  /** Asks the API who is signed in; any error means nobody. */
  async refresh(): Promise<CurrentUser | null> {
    try {
      const user = await firstValueFrom(this.http.get<CurrentUser>('/api/auth/me'));
      this.current.set(user);
      return user;
    } catch {
      this.current.set(null);
      return null;
    }
  }

  /** Rejects with the `HttpErrorResponse` when the sign-in fails. */
  async signIn(request: SignInRequest): Promise<void> {
    const user = await firstValueFrom(this.http.post<CurrentUser>('/api/auth/sign-in', request));
    this.current.set(user);
  }

  /**
   * Clears the user once the server session is gone (204, or 401 when it had already ended).
   * Any other failure leaves the user signed in and rejects, because the server session is
   * probably still alive.
   */
  async signOut(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>('/api/auth/sign-out', null));
    } catch (error) {
      if (!(error instanceof HttpErrorResponse && error.status === 401)) {
        throw error;
      }
    }
    this.current.set(null);
  }

  clear(): void {
    this.current.set(null);
  }
}
