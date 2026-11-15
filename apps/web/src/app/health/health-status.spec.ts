import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { HealthResponse } from '@espace-client/shared';
import { HealthStatus } from './health-status';

describe('HealthStatus', () => {
  let fixture: ComponentFixture<HealthStatus>;
  let http: HttpTestingController;

  /** Text displayed right now, without waiting for the HTTP response. */
  function textNow(): string {
    fixture.detectChanges();
    const el = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="health-status"]',
    );
    return el?.textContent?.trim() ?? '';
  }

  /**
   * Text displayed once the application is stable. With httpResource, a pending request
   * prevents stability: only call this after answering the request.
   */
  async function text(): Promise<string> {
    await fixture.whenStable();
    return textNow();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HealthStatus],
      providers: [provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HealthStatus);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it("shows « Vérification de l'API… » while the request is pending", () => {
    http.expectOne('/api/health');
    expect(textNow()).toBe("Vérification de l'API…");
  });

  it('shows « API connectée » when the API answers ok', async () => {
    const body: HealthResponse = {
      status: 'ok',
      database: 'up',
      timestamp: '2026-11-14T10:00:00.000Z',
    };
    http.expectOne('/api/health').flush(body);
    expect(await text()).toBe('API connectée');
  });

  it('shows « Base de données injoignable » when the database is down', async () => {
    const body: HealthResponse = {
      status: 'ok',
      database: 'down',
      timestamp: '2026-11-15T10:00:00.000Z',
    };
    http.expectOne('/api/health').flush(body);
    expect(await text()).toBe('Base de données injoignable');
  });

  it('shows an error when the API is unreachable', async () => {
    http.expectOne('/api/health').error(new ProgressEvent('error'));
    expect(await text()).toBe('API injoignable');
  });

  it('shows an error on an empty 200 response', async () => {
    http.expectOne('/api/health').flush(null);
    expect(await text()).toBe('API injoignable');
  });

  it('shows an error on a 404 response', async () => {
    http.expectOne('/api/health').flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(await text()).toBe('API injoignable');
  });
});
