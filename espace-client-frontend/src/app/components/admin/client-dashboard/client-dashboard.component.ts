import { Component, effect, inject, OnInit } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ClientActionButtonComponent } from './partials/client-action-button/client-action-button.component';
import { ViewClientButtonComponent } from './partials/view-client-button/view-client-button.component';
import { CreateClientButtonComponent } from "./partials/create-client-button/create-client-button.component";

@Component({
  selector: 'app-client-dashboard',
  providers: [MessageService],
  imports: [
    ButtonModule,
    MenuModule,
    ToastModule,
    DialogModule,
    ClientActionButtonComponent,
    ViewClientButtonComponent,
    CreateClientButtonComponent
],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss',
})
export class ClientDashboardComponent implements OnInit {
  private clientService = inject(ClientService);
  clients: Client[] = [];

  constructor() {
    effect(() => {
      this.clients = this.clientService.clients();
    });
  }
  ngOnInit(): void {
    this.clientService.getAllClients();
  }
}
