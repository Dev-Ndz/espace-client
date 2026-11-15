import { Component, inject, signal } from '@angular/core';
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
      @if (signOutFailed()) {
        <p role="alert">La déconnexion a échoué. Réessayez.</p>
      }
      <app-health-status />
    </main>
  `,
})
export class HomePage {
  protected readonly session = inject(AuthSession);
  private readonly router = inject(Router);

  protected readonly signOutFailed = signal(false);

  protected async signOut(): Promise<void> {
    this.signOutFailed.set(false);
    try {
      await this.session.signOut();
    } catch {
      this.signOutFailed.set(true);
      return;
    }
    await this.router.navigateByUrl('/connexion');
  }
}
