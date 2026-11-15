import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  type TestRequest,
} from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { redirectIfSignedIn, requireSignedIn } from './auth-guards';

@Component({ template: '' })
class Dummy {}

describe('auth guards', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'connexion', canActivate: [redirectIfSignedIn], component: Dummy },
          { path: 'projets', canActivate: [requireSignedIn], component: Dummy },
          // Unguarded: the harness navigates to '' when it is created.
          { path: '', component: Dummy },
        ]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    http.verify();
  });

  /**
   * Navigates to `url` and answers every `me` request the guards issue (a redirect to the
   * sign-in page runs its guard, which checks the session again), then returns the final URL.
   * The navigation cannot be awaited before the requests are answered.
   */
  async function navigate(url: string, answer: (me: TestRequest) => void) {
    const router = TestBed.inject(Router);
    let done = false;
    const navigation = router.navigateByUrl(url).finally(() => (done = true));
    while (!done) {
      // The guards are async: give them a macrotask to issue their request.
      await new Promise((resolve) => setTimeout(resolve));
      for (const me of http.match('/api/auth/me')) {
        answer(me);
      }
    }
    await navigation;
    await harness.fixture.whenStable();
    return router.url;
  }

  const signedOut = (me: TestRequest) =>
    me.flush(null, { status: 401, statusText: 'Unauthorized' });
  const signedIn = (me: TestRequest) => me.flush({ id: '1', email: 'ada@example.com' });

  it('sends a signed-out visitor to the sign-in page, keeping the target', async () => {
    expect(await navigate('/projets', signedOut)).toBe('/connexion?retour=%2Fprojets');
  });

  it('sends the visitor to the sign-in page when the session check fails', async () => {
    expect(await navigate('/projets', (me) => me.error(new ProgressEvent('error')))).toBe(
      '/connexion?retour=%2Fprojets',
    );
  });

  it('lets a signed-in visitor through', async () => {
    expect(await navigate('/projets', signedIn)).toBe('/projets');
  });

  it('sends a signed-in visitor away from the sign-in page', async () => {
    expect(await navigate('/connexion', signedIn)).toBe('/');
  });
});
