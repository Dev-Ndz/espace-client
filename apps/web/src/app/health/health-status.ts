import { Component, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import type { ResourceStatus } from '@angular/core';
import type { HealthResponse } from '@espace-client/shared';

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
  // La requête part dès la création du composant. `null` : un proxy peut répondre 200 sans corps.
  private readonly health = httpResource<HealthResponse | null>(() => '/api/health');

  private readonly state = computed<HealthState>(() => {
    const status: ResourceStatus = this.health.status();
    switch (status) {
      case 'idle':
      case 'loading':
      case 'reloading':
        return 'loading';
      case 'resolved':
      case 'local':
        return this.health.value()?.status === 'ok' ? 'ok' : 'error';
      case 'error':
        return 'error';
    }
  });

  protected readonly label = computed(() => LABELS[this.state()]);
}
