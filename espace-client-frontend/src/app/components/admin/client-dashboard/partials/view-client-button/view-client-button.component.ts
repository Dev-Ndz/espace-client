import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Client } from '../../../../../models/client';
import { ClientFormModeService } from '../../../../../services/client-form-mode.service';

@Component({
  selector: 'app-view-client-button',
  imports: [ButtonModule],
  templateUrl: './view-client-button.component.html',
  styleUrl: './view-client-button.component.scss',
})
export class ViewClientButtonComponent {
  @Input() client!: Client;
  router = inject(Router);
  modeService = inject(ClientFormModeService);
  viewClient() {
    this.modeService.mode.set('view');
    this.router.navigate(['admin/client', this.client.id, 'info']);
  }
}
