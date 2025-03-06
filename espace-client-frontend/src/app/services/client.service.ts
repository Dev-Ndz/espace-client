import { inject, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Client } from '../models/client';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  http = inject(HttpClient);
  clients = signal<Client[]>([]);
  client = signal<Client | undefined>(undefined);

  getConnectedClient(): void {
    this.http
      .get<Client>(environment.apiUrl + '/auth/me')
      .subscribe((client) => {
        this.client.set(client);
      });
  }

  getClientById(clientId: string): Observable<Client> {
    const client = this.clients().find((client) => client.id === clientId);
    if (client) {
      return of(client);
    } else {
      return this.http.get<Client>(`${environment.apiUrl}/client/${clientId}`);
    }
  }
  getAllClients() {
    this.http.get<Client[]>(environment.apiUrl + '/client').subscribe({
      next: (clients) => {
        this.clients.set(clients);
      },
      error: (err) => console.error(err),
    });
  }
  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(environment.apiUrl + '/client', client);
  }
  updateClient(client: Client, id: string): Observable<Client> {
    return this.http.patch<Client>(
      environment.apiUrl + '/client/' + id,
      client
    );
  }
  deleteClient(id: string): Observable<Client> {
    return this.http.delete<Client>(environment.apiUrl + '/client/' + id);
  }

  addUser(clientId: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(environment.apiUrl + '/invitation', {
      clientId,
    });
  }
}
