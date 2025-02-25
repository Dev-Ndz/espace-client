import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '../models/client';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  http = inject(HttpClient);
  clients = signal<Client[]>([]);

  ID = '7ba7b9ee-940d-4511-adfc-5659cb92a0cd';
  getClient(): Observable<Client> {
    return this.http.get<Client>(environment.apiUrl + '/client/' + this.ID);
  }
  getAllClients() {
    this.http.get<Client[]>(environment.apiUrl + '/client').subscribe({
      next: (clients) => {
        this.clients.set(clients);
      },
      error: (err) => console.error(err),
    });
  }
}
