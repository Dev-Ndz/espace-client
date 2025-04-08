import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './partials/navigation/navigation.component';
import { ClientService } from '../../../../services/client.service';
import { Client } from '../../../../models/client';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-user',
  imports: [RouterOutlet, NavigationComponent, HeaderComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  private clientService = inject(ClientService);

  client?: Client;
  constructor() {
    effect(() => {
      this.client = this.clientService.client();
    });
  }

  ngOnInit() {
    this.clientService.getConnectedClient();
    this.clientService.getAllClients();
  }
}
