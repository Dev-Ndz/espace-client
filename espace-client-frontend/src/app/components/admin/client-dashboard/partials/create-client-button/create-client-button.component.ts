import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-create-client-button',
  imports: [ButtonModule],
  templateUrl: './create-client-button.component.html',
  styleUrl: './create-client-button.component.scss',
})
export class CreateClientButtonComponent {
  private router = inject(Router);
  newClient(): void {
    this.router.navigate(['admin/client', 'new']);
  }
}
