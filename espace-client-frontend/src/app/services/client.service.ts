import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '../models/client';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  http = inject(HttpClient);

  ID = 'c9bb3e5d-0bd1-4cba-909b-dece1baf5239';
  getClient(): Observable<Client> {
    return this.http.get<Client>(environment.apiUrl + '/client/' + this.ID);
  }
}
