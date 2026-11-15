import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AuthSession } from '../auth/auth-session';
import { HomePage } from './home-page';

@Component({ template: '' })
class Dummy {}

describe('HomePage', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'connexion', component: Dummy },
          { path: '', component: HomePage },
        ]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    // Sign in through the session so that its `user` signal is set.
    const session = TestBed.inject(AuthSession);
    const signedIn = session.signIn({ email: 'ada@example.com', password: 'secret' });
    http.expectOne('/api/auth/sign-in').flush({ id: '1', email: 'ada@example.com' });
    await signedIn;

    harness = await RouterTestingHarness.create('/');
    http
      .expectOne('/api/health')
      .flush({ status: 'ok', database: 'up', timestamp: '2026-11-15T10:00:00.000Z' });
    await harness.fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
  });

  it('shows who is signed in', () => {
    harness.detectChanges();
    const text = (harness.routeNativeElement as HTMLElement).textContent;
    expect(text).toContain('Connecté en tant que ada@example.com');
  });

  it('signs out and goes to the sign-in page when clicking « Se déconnecter »', async () => {
    const button = (harness.routeNativeElement as HTMLElement).querySelector('button');
    expect(button?.textContent?.trim()).toBe('Se déconnecter');
    button?.click();
    http.expectOne('/api/auth/sign-out').flush(null, { status: 204, statusText: 'No Content' });
    await vi.waitFor(() => {
      expect(TestBed.inject(Router).url).toBe('/connexion');
    });
    expect(TestBed.inject(AuthSession).user()).toBeNull();
  });
});
