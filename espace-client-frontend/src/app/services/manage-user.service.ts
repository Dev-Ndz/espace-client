import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class ManageUserService {
  private http = inject(HttpClient);
  getUsersByClient(clientId: string) {
    return this.http.get<User[]>(
      environment.apiUrl + '/user/client/' + clientId
    );
  }
  update(id: string, data: User) {
    return this.http.put<User>(environment.apiUrl + '/user/' + id, data);
  }

  delete(id: string) {
    return this.http.delete<User>(environment.apiUrl + '/user/' + id);
  }
}
