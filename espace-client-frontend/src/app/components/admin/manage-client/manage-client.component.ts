import { Component, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { ManageClientMenuComponent } from './partials/manage-client-menu/manage-client-menu.component';
import { ButtonModule } from 'primeng/button';
import { Client } from '../../../models/client';

@Component({
  selector: 'app-manage-client',
  imports: [RouterOutlet, ManageClientMenuComponent, ButtonModule],
  templateUrl: './manage-client.component.html',
  styleUrl: './manage-client.component.scss',
})
export class ManageClientComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private router = inject(Router);
  client?: Client;
  constructor() {
    effect(() => {
      this.client = this.clientService.client();
    });
  }
  ngOnInit(): void {
    const clientId = this.activatedRoute.snapshot.params['id'];
    if (clientId) {
      this.clientService.getClientById(clientId);
    }
  }
  navigateToDashboard() {
    this.router.navigate(['admin / client - dashboard']);
  }
}
