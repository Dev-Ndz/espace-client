import { Component, computed, inject, signal } from '@angular/core';
import { HealthClient } from './health-client';

type HealthState = 'loading' | 'ok' | 'error';

const LABELS: Record<HealthState, string> = {
  loading: "Vérification de l'API…",
  ok: 'API connectée',
  error: 'API injoignable',
};

@Component({
  selector: 'app-health-status',
  template: `<p data-testid="health-status">{{ label() }}</p>`,
})
export class HealthStatus {
  private readonly state = signal<HealthState>('loading');
  protected readonly label = computed(() => LABELS[this.state()]);

  constructor() {
    inject(HealthClient)
      .getHealth()
      .subscribe({
        next: (res) => this.state.set(res.status === 'ok' ? 'ok' : 'error'),
        error: () => this.state.set('error'),
      });
  }
}
