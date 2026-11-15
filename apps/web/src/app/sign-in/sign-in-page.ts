import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthSession } from '../auth/auth-session';
import { safeReturnUrl } from '../auth/safe-return-url';

function messageFor(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) {
      return 'Adresse e-mail ou mot de passe incorrect.';
    }
    if (error.status === 429) {
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    }
  }
  return 'Le serveur est injoignable.';
}

@Component({
  selector: 'app-sign-in-page',
  imports: [FormField],
  template: `
    <main class="sign-in">
      <h1>Connexion</h1>
      <form novalidate (submit)="onSubmit($event)">
        <div class="field">
          <label for="email">Adresse e-mail</label>
          <input id="email" type="email" autocomplete="username" [formField]="signInForm.email" />
          @if (signInForm.email().touched() && signInForm.email().invalid()) {
            <p class="field-error">Champ obligatoire.</p>
          }
        </div>
        <div class="field">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            autocomplete="current-password"
            [formField]="signInForm.password"
          />
          @if (signInForm.password().touched() && signInForm.password().invalid()) {
            <p class="field-error">Champ obligatoire.</p>
          }
        </div>
        @if (errorMessage(); as message) {
          <p class="form-error" role="alert">{{ message }}</p>
        }
        <button type="submit" [disabled]="signInForm().submitting()">Se connecter</button>
      </form>
    </main>
  `,
})
export class SignInPage {
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly model = signal({ email: '', password: '' });
  protected readonly signInForm = form(this.model, (path) => {
    required(path.email);
    required(path.password);
  });
  protected readonly errorMessage = signal<string | null>(null);

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage.set(null);
    await submit(this.signInForm, async () => {
      const { email, password } = this.model();
      try {
        await this.session.signIn({ email, password });
      } catch (error) {
        this.errorMessage.set(messageFor(error));
        this.model.update((value) => ({ ...value, password: '' }));
        this.signInForm.password().reset();
        return;
      }
      await this.router.navigateByUrl(
        safeReturnUrl(this.route.snapshot.queryParamMap.get('retour')),
      );
    });
  }
}
