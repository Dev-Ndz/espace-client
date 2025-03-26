import { Component, effect, inject, Input } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ClientFormComponent } from './partials/client-form/client-form.component';
import { ClientViewComponent } from './partials/client-view/client-view.component';
import { ButtonModule } from 'primeng/button';
import { ClientFormModeService } from '../../../services/client-form-mode.service';

@Component({
  selector: 'app-client',
  providers: [MessageService],
  imports: [
    ToastModule,
    ClientFormComponent,
    ClientViewComponent,
    ButtonModule,
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent {
  private clientService = inject(ClientService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  public modeService = inject(ClientFormModeService);

  public loading = false;
  @Input() userType?: 'USER' | 'ADMIN';
  client?: Client;

  constructor() {
    effect(() => {
      this.client = this.clientService.client();
    });
  }

  switchMode() {
    this.modeService.switchMode();
  }
  createClient(client: Client) {
    this.loading = true;
    this.clientService.createClient(client).subscribe({
      next: (client) => {
        this.clientService.clients.update((clientList) => {
          clientList.push(client);
          return clientList;
        });
        this.loading = false;

        this.router.navigate(['admin/client-dashboard']);
      },
      error: (err) => {
        console.error('erreur lors de la création du client', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la création du client',
        });
        this.loading = false;
      },
    });
  }

  updateClient(client: Client) {
    this.loading = true;
    this.clientService.updateClient(client, this.client!.id!).subscribe({
      next: (client) => {
        if (this.userType === 'USER') {
          this.clientService.client.set(client);
          this.switchMode();
        } else {
          this.clientService.clients.update((clientList) => {
            clientList.push(client);
            return clientList;
          });
          this.router.navigate(['admin/client-dashboard']);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('erreur lors de la création du client', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la mise à jour du client',
        });
        this.loading = false;
      },
    });
  }

  onSubmit(client: Client) {
    if (this.modeService.mode() === 'new') {
      this.createClient(client);
    }
    if (this.modeService.mode() === 'edit') {
      this.updateClient(client);
    }
  }
}
