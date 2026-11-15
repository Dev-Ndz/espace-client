import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';

describe('App', () => {
  it('affiche le titre « Espace client »', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    // HealthStatus interroge l'API : on répond pour que l'application devienne stable.
    TestBed.inject(HttpTestingController)
      .expectOne('/api/health')
      .flush({ status: 'ok', timestamp: '2026-11-14T10:00:00.000Z' });
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Espace client');
  });
});
