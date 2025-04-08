import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ClientFormModeService } from '../../../../../services/client-form-mode.service';
import { ClientService } from '../../../../../services/client.service';

@Component({
  selector: 'app-create-client-button',
  imports: [ButtonModule],
  templateUrl: './create-client-button.component.html',
  styleUrl: './create-client-button.component.scss',
})
export class CreateClientButtonComponent {
  private router = inject(Router);
  private modeService = inject(ClientFormModeService);
  private clientService = inject(ClientService);
  newClient(): void {
    this.modeService.mode.set('new');
    this.router.navigate(['admin/client']);
  }
}
