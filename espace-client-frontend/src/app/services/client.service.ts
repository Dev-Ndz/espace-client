import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Client } from '../models/client';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  // constructor() {}
  private fakeClient: Client = {
    id: '1',
    name: 'Entreprise Alpha',
    description: 'Spécialiste en solutions cloud',
    logo: 'https://images.unsplash.com/reserve/LJIZlzHgQ7WPSh5KVTCB_Typewriter.jpg?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cmFuZG9tfGVufDB8fDB8fHww',
    cover:
      'https://cdn.pixabay.com/photo/2023/04/30/10/05/philodendron-7960228_1280.jpg',
    facturationAddress: '123 Rue des Entrepreneurs, Paris',
    facturationFirstName: 'Jean',
    facturationLastName: 'Dupont',
    facturationEmail: 'facturation@alpha.com',
    facturationPhone: '+33 1 23 45 67 89',
    isVatLiable: true,
    vatNumber: 123456789,
  };

  client = new BehaviorSubject('');
  getClient(): Observable<Client> {
    return of<Client>(this.fakeClient);
  }
}
