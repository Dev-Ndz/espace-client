import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { CurrentUser } from '@espace-client/shared';
import { AuthSession } from './auth-session';

describe('AuthSession', () => {
  const ada: CurrentUser = { id: '1', email: 'ada@example.com' };
  let session: AuthSession;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    session = TestBed.inject(AuthSession);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('refresh() resolves the current user and stores it', async () => {
    const result = session.refresh();
    http.expectOne('/api/auth/me').flush(ada);
    expect(await result).toEqual(ada);
    expect(session.user()).toEqual(ada);
  });

  it('refresh() resolves null on a 401', async () => {
    const result = session.refresh();
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(await result).toBeNull();
    expect(session.user()).toBeNull();
  });

  it('refresh() resolves null on a network error', async () => {
    const result = session.refresh();
    http.expectOne('/api/auth/me').error(new ProgressEvent('error'));
    expect(await result).toBeNull();
  });

  it('signIn() stores the user on success', async () => {
    const result = session.signIn({ email: ada.email, password: 'secret' });
    const req = http.expectOne('/api/auth/sign-in');
    expect(req.request.body).toEqual({ email: ada.email, password: 'secret' });
    req.flush(ada);
    await result;
    expect(session.user()).toEqual(ada);
  });

  it('signIn() rejects with the HttpErrorResponse on a 401', async () => {
    const result = session.signIn({ email: ada.email, password: 'wrong' });
    http.expectOne('/api/auth/sign-in').flush(null, { status: 401, statusText: 'Unauthorized' });
    await expect(result).rejects.toBeInstanceOf(HttpErrorResponse);
    await expect(result).rejects.toMatchObject({ status: 401 });
    expect(session.user()).toBeNull();
  });

  async function signInAda(): Promise<void> {
    const signedIn = session.signIn({ email: ada.email, password: 'secret' });
    http.expectOne('/api/auth/sign-in').flush(ada);
    await signedIn;
  }

  it.each([
    ['204', { status: 204, statusText: 'No Content' }],
    ['401', { status: 401, statusText: 'Unauthorized' }],
  ])('signOut() clears the user when the server answers %s', async (_label, init) => {
    await signInAda();
    const result = session.signOut();
    http.expectOne('/api/auth/sign-out').flush(null, init);
    await result;
    expect(session.user()).toBeNull();
  });

  it.each([
    ['500', { status: 500, statusText: 'Server Error' }],
    ['network error', { status: 0, statusText: 'Unknown Error' }],
  ])('signOut() rejects and keeps the user on %s', async (_label, init) => {
    await signInAda();
    const result = session.signOut();
    http.expectOne('/api/auth/sign-out').flush(null, init);
    await expect(result).rejects.toBeInstanceOf(HttpErrorResponse);
    expect(session.user()).toEqual(ada);
  });
});
