import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { HealthResponse } from '@espace-client/shared';
import { HealthStatus } from './health-status';

describe('HealthStatus', () => {
  let fixture: ComponentFixture<HealthStatus>;
  let http: HttpTestingController;

  /** Texte affiché tout de suite, sans attendre la réponse HTTP. */
  function textNow(): string {
    fixture.detectChanges();
    const el = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="health-status"]',
    );
    return el?.textContent?.trim() ?? '';
  }

  /**
   * Texte affiché une fois l'application stable. Avec httpResource, une requête en cours
   * empêche la stabilité : n'appeler qu'après avoir répondu à la requête.
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

  it("affiche « Vérification de l'API… » pendant l'appel", () => {
    http.expectOne('/api/health');
    expect(textNow()).toBe("Vérification de l'API…");
  });

  it("affiche « API connectée » quand l'API répond ok", async () => {
    const body: HealthResponse = { status: 'ok', timestamp: '2026-11-14T10:00:00.000Z' };
    http.expectOne('/api/health').flush(body);
    expect(await text()).toBe('API connectée');
  });

  it("affiche une erreur si l'API ne répond pas", async () => {
    http.expectOne('/api/health').error(new ProgressEvent('error'));
    expect(await text()).toBe('API injoignable');
  });

  it('affiche une erreur sur une réponse 200 vide', async () => {
    http.expectOne('/api/health').flush(null);
    expect(await text()).toBe('API injoignable');
  });

  it('affiche une erreur sur une réponse 404', async () => {
    http.expectOne('/api/health').flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(await text()).toBe('API injoignable');
  });
});
