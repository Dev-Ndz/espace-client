import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { firstValueFrom } from 'rxjs';
import { AuthSession } from './auth-session';
import { redirectOnUnauthorized } from './redirect-on-unauthorized';

@Component({ template: '' })
class Dummy {}

describe('redirectOnUnauthorized', () => {
  let http: HttpTestingController;
  let client: HttpClient;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([redirectOnUnauthorized])),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'projets', component: Dummy },
          { path: 'connexion', component: Dummy },
        ]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    await RouterTestingHarness.create('/projets');
  });

  afterEach(() => {
    http.verify();
  });

  /** Sends a GET answered with `status`; resolves once the redirection (if any) has settled. */
  async function respondWith(url: string, status: number) {
    const result = firstValueFrom(client.get(url)).then(
      () => undefined,
      (error: { status: number }) => error,
    );
    http.expectOne(url).flush(null, { status, statusText: 'Error' });
    const error = await result;
    await TestBed.inject(Router).navigated;
    await new Promise((resolve) => setTimeout(resolve));
    return error;
  }

  it('clears the session, redirects to the sign-in page and rethrows on a 401', async () => {
    const session = TestBed.inject(AuthSession);
    const signedIn = session.signIn({ email: 'ada@example.com', password: 'secret' });
    http.expectOne('/api/auth/sign-in').flush({ id: '1', email: 'ada@example.com' });
    await signedIn;

    const error = await respondWith('/api/anything', 401);

    expect(error?.status).toBe(401);
    expect(session.user()).toBeNull();
    expect(router.url).toBe('/connexion?retour=%2Fprojets');
  });

  it.each(['/api/auth/sign-in', '/api/auth/me'])(
    'does not redirect on a 401 from %s',
    async (url) => {
      const error = await respondWith(url, 401);
      expect(error?.status).toBe(401);
      expect(router.url).toBe('/projets');
    },
  );

  it('does not redirect on a 500', async () => {
    const error = await respondWith('/api/anything', 500);
    expect(error?.status).toBe(500);
    expect(router.url).toBe('/projets');
  });
});
