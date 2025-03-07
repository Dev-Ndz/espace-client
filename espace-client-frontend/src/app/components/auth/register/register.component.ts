import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  token: string | null = null;
  authService = inject(AuthService);
  messageService = inject(MessageService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  loading = false;
  registerForm = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', Validators.required),
    confirmPassword: new FormControl<string>('', Validators.required),
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || null;
      console.log('Token reçu:', this.token);
    });
  }

  onRegister() {
    this.loading = true;
    if (!this.token) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur ',
        detail:
          "erreur dans la récupération de l'identifiant de l'invitation - contactez l'administrateur",
      });
      this.loading = false;
    } else if (!this.registerForm.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'formulaire invalide',
        detail: 'remplissez tous les champs du formulaire',
      });
      this.loading = false;
    } else {
      const email = this.registerForm.get('email')?.value || '';
      const password = this.registerForm.get('password')?.value || '';
      console.log(email, password, this.token);
      this.authService.register(email, password, this.token).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'compte créé',
            detail:
              'Votre compte a bien été créé, vous pouvez vous connecter avec ces identifiants',
          });
          this.loading = false;
          setInterval(() => this.router.navigate(['auth/login']), 1000);
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'erreur',
            detail: "erreur lors de l'enregistrement de votre compte",
          });
          this.loading = false;
        },
      });
    }
  }
}
