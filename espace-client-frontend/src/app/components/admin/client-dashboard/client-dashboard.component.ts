import { Component, effect, inject, OnInit } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-dashboard',
  providers: [MessageService],
  imports: [ButtonModule, MenuModule, ToastModule],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss',
})
export class ClientDashboardComponent implements OnInit {
  private clientService = inject(ClientService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  selectedClientId = '';
  clients: Client[] = [];
  items: MenuItem[] = [
    {
      label: 'modifier',
      icon: 'pi pi-pencil',
      command: () => {
        console.log('modification');
      },
    },
    {
      label: 'ajouter un utilisateur',
      icon: 'pi pi-user-plus',
      command: () => {
        this.addClient();
      },
    },
    {
      label: 'supprimer',
      icon: 'pi pi-trash',
      command: () => {
        console.log('modification');
      },
    },
  ];
  constructor() {
    effect(() => {
      this.clients = this.clientService.clients();
    });
  }
  ngOnInit(): void {
    this.clientService.getAllClients();
  }

  newClient(): void {
    this.router.navigate(['admin/client']);
  }

  addClient() {
    this.clientService.addClient(this.selectedClientId).subscribe({
      next: (response) => {
        console.log('add client', response);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: "Erreur lors de la création de l'utilisateur",
        });
      },
    });
  }
}
