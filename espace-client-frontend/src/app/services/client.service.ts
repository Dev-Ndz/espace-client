import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '../models/client';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  http = inject(HttpClient);
  clients = signal<Client[]>([]);
  client = signal<Client | undefined>(undefined);

  CLIENT_API_URL = environment.apiUrl + '/client';
  API_URL = environment.apiUrl;

  getConnectedClient(): void {
    this.http
      .get<Client>(environment.apiUrl + '/auth/me')
      .subscribe((client) => {
        this.client.set(client);
      });
  }

  getClientById(clientId: string): void {
    const client = this.clients().find((client) => client.id === clientId);
    if (client) {
      this.client.set(client);
    } else {
      this.http
        .get<Client>(`${this.CLIENT_API_URL}/${clientId}`)
        .subscribe((client) => {
          this.client.set(client);
        });
    }
  }
  getAllClients() {
    this.http.get<Client[]>(this.CLIENT_API_URL).subscribe({
      next: (clients) => {
        this.clients.set(clients);
      },
      error: (err) => console.error(err),
    });
  }
  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.CLIENT_API_URL, client);
  }
  updateClient(client: Client, id: string): Observable<Client> {
    return this.http.patch<Client>(
      environment.apiUrl + '/client/' + id,
      client
    );
  }
  deleteClient(id: string): Observable<Client> {
    return this.http.delete<Client>(this.CLIENT_API_URL + '/' + id);
  }

  addUser(clientId: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(this.API_URL + '/invitation', {
      clientId,
    });
  }

  removeClientFromClientsList(clientId: string) {
    this.clients.update((clients) => {
      return clients.filter((client) => client.id !== clientId);
    });
  }
}
