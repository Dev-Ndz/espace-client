import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { ClientComponent } from '../../shared/client/client.component';
import { ClientFormModeService } from '../../../services/client-form-mode.service';

@Component({
  selector: 'app-manage-client',
  imports: [ClientComponent],
  templateUrl: './manage-client.component.html',
  styleUrl: './manage-client.component.scss',
})
export class ManageClientComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private modeService = inject(ClientFormModeService);

  ngOnInit(): void {
    const mode = this.activatedRoute.snapshot.params['mode'];
    this.modeService.mode.set(mode);
    const clientId = this.activatedRoute.snapshot.params['id'];
    if (clientId) {
      this.clientService.getClientById(clientId);
    }
  }
}
