import { Component, effect, inject, OnInit } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-client-dashboard',
  providers: [MessageService],
  imports: [
    ButtonModule,
    MenuModule,
    ToastModule,
    DialogModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss',
})
export class ClientDashboardComponent implements OnInit {
  private clientService = inject(ClientService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  visible = false;
  loading = false;
  link?: string;
  selectedClientId = '';
  clients: Client[] = [];
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
  constructor() {
    effect(() => {
      this.clients = this.clientService.clients();
      console.log(this.clients);
    });
  }
  ngOnInit(): void {
    this.clientService.getAllClients();
  }
  viewClient(clientId: string) {
    console.log(clientId);
    this.router.navigate(['admin/client', 'view', clientId]);
  }
  newClient(): void {
    this.router.navigate(['admin/client', 'new']);
  }
  editClient(): void {
    this.router.navigate(['admin/client', 'edit', this.selectedClientId]);
  }
  deleteClient() {
    this.loading = true;
    this.clientService.deleteClient(this.selectedClientId).subscribe({
      next: (deletedClient) => {
        this.clientService.clients.update((clients) => {
          return clients.filter((client) => client.id !== deletedClient.id);
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du client :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la suppression du client',
        });
        this.loading = false;
      },
    });
  }

  createUser() {
    this.loading = true;
    this.visible = true;
    this.clientService.addUser(this.selectedClientId).subscribe({
      next: (response) => {
        this.link = response.url;
        console.log('add client', response);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: "Erreur lors de la création de l'utilisateur",
        });
        this.loading = false;
        this.visible = false;
      },
    });
  }

  copyLink() {
    if (this.link) navigator.clipboard.writeText(this.link);
    this.messageService.add({
      severity: 'success',
      summary: 'lien copié',
      detail: "Le lien d'invitation est copié",
    });
  }
}
