import { Component, effect, inject, OnInit } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
// import { ToastModule } from 'primeng/toast';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-dashboard',
  imports: [ButtonModule, MenuModule],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss',
})
export class ClientDashboardComponent implements OnInit {
  private clientService = inject(ClientService);
  private router = inject(Router);
  clients: Client[] = [];
  items: MenuItem[] = [
    { label: 'modifier', icon: 'pi pi-pencil' },
    { label: 'ajouter un utilisateur', icon: 'pi pi-user-plus' },
    { label: 'supprimer', icon: 'pi pi-trash' },
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
}
