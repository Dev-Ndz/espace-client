import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { redirectIfSignedIn } from '../auth/auth-guards';
import { SignInPage } from './sign-in-page';

@Component({ template: '' })
class Dummy {}

describe('SignInPage', () => {
  let http: HttpTestingController;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'connexion', canActivate: [redirectIfSignedIn], component: SignInPage },
          { path: 'projets', component: Dummy },
          { path: '', component: Dummy },
        ]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  /** Opens the sign-in page; its guard asks `/me` first, answered as signed out. */
  async function open(url = '/connexion') {
    const harness = await RouterTestingHarness.create();
    const navigation = harness.navigateByUrl(url);
    await vi.waitFor(() =>
      http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' }),
    );
    await navigation;
    await harness.fixture.whenStable();
    root = harness.routeNativeElement as HTMLElement;
    return harness;
  }

  const email = () => root.querySelector<HTMLInputElement>('#email')!;
  const password = () => root.querySelector<HTMLInputElement>('#password')!;
  const button = () => root.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const alert = () => root.querySelector('[role="alert"]')?.textContent?.trim();

  function type(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function fillAndSubmit(harness: RouterTestingHarness) {
    type(email(), 'ada@example.com');
    type(password(), 'secret');
    harness.detectChanges();
    button().click();
    harness.detectChanges();
  }

  it('has labelled email and password inputs and a submit button', async () => {
    await open();
    expect(root.querySelector('h1')?.textContent).toBe('Connexion');
    expect(root.querySelector('label[for="email"]')?.textContent).toBe('Adresse e-mail');
    expect(email().type).toBe('email');
    expect(email().autocomplete).toBe('username');
    expect(root.querySelector('label[for="password"]')?.textContent).toBe('Mot de passe');
    expect(password().type).toBe('password');
    expect(password().autocomplete).toBe('current-password');
    expect(button().textContent?.trim()).toBe('Se connecter');
  });

  it('sends nothing and flags both fields when submitted empty', async () => {
    const harness = await open();
    button().click();
    harness.detectChanges();
    http.expectNone('/api/auth/sign-in');
    const errors = Array.from(root.querySelectorAll('.field-error')).map((e) => e.textContent);
    expect(errors).toEqual(['Champ obligatoire.', 'Champ obligatoire.']);
  });

  it('signs in with the typed values and goes to the return url', async () => {
    const harness = await open('/connexion?retour=%2Fprojets');
    fillAndSubmit(harness);
    const request = http.expectOne('/api/auth/sign-in');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'ada@example.com', password: 'secret' });
    request.flush({ id: '1', email: 'ada@example.com' });
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/projets'));
  });

  it.each([['/connexion'], ['/connexion?retour=%2F%2Fevil.example']])(
    'goes home when the return url is missing or unsafe (%s)',
    async (url) => {
      const harness = await open(url);
      fillAndSubmit(harness);
      http.expectOne('/api/auth/sign-in').flush({ id: '1', email: 'ada@example.com' });
      await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/'));
    },
  );

  it.each([
    [401, 'Adresse e-mail ou mot de passe incorrect.'],
    [429, 'Trop de tentatives. Réessayez dans quelques minutes.'],
    [500, 'Le serveur est injoignable.'],
  ])(
    'shows the message for a %s answer, empties the password, keeps the email',
    async (status, message) => {
      const harness = await open();
      fillAndSubmit(harness);
      http.expectOne('/api/auth/sign-in').flush(null, { status, statusText: 'Error' });
      await vi.waitFor(() => {
        harness.detectChanges();
        expect(alert()).toBe(message);
      });
      expect(password().value).toBe('');
      expect(email().value).toBe('ada@example.com');
      expect(root.querySelectorAll('.field-error')).toHaveLength(0);
    },
  );

  it('shows the unreachable message on a network error', async () => {
    const harness = await open();
    fillAndSubmit(harness);
    http.expectOne('/api/auth/sign-in').error(new ProgressEvent('error'));
    await vi.waitFor(() => {
      harness.detectChanges();
      expect(alert()).toBe('Le serveur est injoignable.');
    });
  });

  it('disables the button and ignores a second submit while pending', async () => {
    const harness = await open();
    fillAndSubmit(harness);
    expect(button().disabled).toBe(true);
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    harness.detectChanges();
    http.expectOne('/api/auth/sign-in').flush(null, { status: 401, statusText: 'Unauthorized' });
    await vi.waitFor(() => {
      harness.detectChanges();
      expect(button().disabled).toBe(false);
    });
  });
});
