import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  providers: [MessageService],
  imports: [
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  profilForm = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', Validators.required),
  });

  authService = inject(AuthService);
  messageService = inject(MessageService);
  router = inject(Router);
  loading = false;

  onLogin(): void {
    const email = this.profilForm.get('email')?.value;
    const password = this.profilForm.get('password')?.value;
    if (email && password) {
      this.loading = true;
      this.authService.login(email, password).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Login successful!',
          });
          this.router.navigate(['/']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Login failed!',
          });
          this.loading = false;
        },
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter email and password',
      });
    }
  }
}
