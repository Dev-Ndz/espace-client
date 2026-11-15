import { Component } from '@angular/core';
import { httpResource } from '@angular/common/http';
import type { HealthResponse } from '@espace-client/shared';

@Component({
  selector: 'app-health-status',
  template: `
    <p data-testid="health-status">
      @if (health.isLoading()) {
        Vérification de l'API…
      } @else if (health.hasValue() && health.value()?.status === 'ok') {
        API connectée
      } @else {
        API injoignable
      }
    </p>
  `,
})
export class HealthStatus {
  // The request starts as soon as the component is created. `null`: a proxy may answer 200 with an empty body.
  protected readonly health = httpResource<HealthResponse | null>(() => '/api/health');
}
