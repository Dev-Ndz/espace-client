import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './partials/navigation/navigation.component';
import { ClientService } from '../../../../services/client.service';
import { Client } from '../../../../models/client';
import { HeaderComponent } from '../../../shared/header/header.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  imports: [RouterOutlet, NavigationComponent, HeaderComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  private clientService = inject(ClientService);
  isLoading = false;
  client?: Client;
  client$?: Subscription;

  getClient() {
    this.isLoading = true;
    this.client$ = this.clientService.getClient().subscribe({
      next: (client: Client) => {
        this.client = client;
        console.log(this.client);
      },
      error: (err) => console.log(err),
      complete: () => (this.isLoading = false),
    });
  }

  ngOnInit() {
    this.getClient();
  }
  ngOnDestroy() {
    if (this.client$) {
      this.client$.unsubscribe();
    }
  }
}
