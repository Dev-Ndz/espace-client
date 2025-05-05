import { Component, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { ClientFormModeService } from '../../../services/client-form-mode.service';
import { ManageClientMenuComponent } from './partials/manage-client-menu/manage-client-menu.component';

@Component({
  selector: 'app-manage-client',
  imports: [RouterOutlet, ManageClientMenuComponent],
  templateUrl: './manage-client.component.html',
  styleUrl: './manage-client.component.scss',
})
export class ManageClientComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private modeService = inject(ClientFormModeService);
  name = '';
  constructor() {
    effect(() => {
      this.name = this.clientService.client()?.name || '';
    });
  }
  ngOnInit(): void {
    const clientId = this.activatedRoute.snapshot.params['id'];
    if (clientId) {
      this.clientService.getClientById(clientId);
    }
  }
}
