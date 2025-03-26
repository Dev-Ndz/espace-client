import { Component, inject, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ClientService } from '../../../../../services/client.service';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

import { LoadingService } from '../../../../../services/loading.service';
import { CreateUserComponent } from '../create-user/create-user.component';

@Component({
  selector: 'app-client-action-button',
  imports: [MenuModule, ButtonModule, CreateUserComponent],
  templateUrl: './client-action-button.component.html',
  styleUrl: './client-action-button.component.scss',
})
export class ClientActionButtonComponent {
  @Input() clientId!: string;
  router = inject(Router);
  loadingService = inject(LoadingService);
  clientService = inject(ClientService);
  messageService = inject(MessageService);
  @ViewChild(CreateUserComponent) createUserComponent!: CreateUserComponent;
  items: MenuItem[] = [
    {
      label: 'modifier',
      icon: 'pi pi-pencil',
      command: () => {
        this.editClient();
      },
    },
    {
      label: 'ajouter un utilisateur',
      icon: 'pi pi-user-plus',
      command: () => {
        this.createUser();
      },
    },
    {
      label: 'supprimer',
      icon: 'pi pi-trash',
      command: () => {
        this.deleteClient();
      },
    },
  ];
  editClient(): void {
    this.router.navigate(['admin/client', 'edit', this.clientId]);
  }
  deleteClient() {
    this.loadingService.loading.set(true);
    this.clientService.deleteClient(this.clientId).subscribe({
      next: (deletedClient) => {
        this.clientService.removeClientFromClientsList(deletedClient.id!);
        this.loadingService.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du client :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la suppression du client',
        });
        this.loadingService.loading.set(false);
      },
    });
  }

  createUser() {
    if (this.createUserComponent) {
      this.createUserComponent.generateLink(this.clientId); // <-- appelle directement la méthode de l’enfant
    }
  }
}
