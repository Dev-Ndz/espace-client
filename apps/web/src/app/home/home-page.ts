import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSession } from '../auth/auth-session';
import { HealthStatus } from '../health/health-status';

@Component({
  selector: 'app-home-page',
  imports: [HealthStatus],
  template: `
    <main>
      <h1>Espace client</h1>
      <p>Connecté en tant que {{ session.user()?.email }}</p>
      <button type="button" (click)="signOut()">Se déconnecter</button>
      <app-health-status />
    </main>
  `,
})
export class HomePage {
  protected readonly session = inject(AuthSession);
  private readonly router = inject(Router);

  protected async signOut(): Promise<void> {
    await this.session.signOut();
    await this.router.navigateByUrl('/connexion');
  }
}
