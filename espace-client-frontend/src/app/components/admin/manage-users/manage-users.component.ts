import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ManageUserService } from '../../../services/manage-user.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../models/user';
import { Subscription } from 'rxjs';
import { ClientService } from '../../../services/client.service';
import { ButtonModule } from 'primeng/button';
import { UpdateUserComponent } from './partials/update-user/update-user.component';
import { DeleteUserComponent } from './partials/delete-user/delete-user.component';

@Component({
  selector: 'app-manage-users',
  imports: [ButtonModule, UpdateUserComponent, DeleteUserComponent],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
})
export class ManageUsersComponent implements OnInit, OnDestroy {
  manageUserService = inject(ManageUserService);
  route = inject(ActivatedRoute);
  clientService = inject(ClientService);
  userListSubscription = new Subscription();
  userList: User[] = [];

  ngOnInit() {
    this.getUserList();
  }
  ngOnDestroy() {
    this.userListSubscription.unsubscribe();
  }

  getUserList() {
    const clientId = this.clientService.client()?.id;
    console.log('getting users for client', clientId);
    if (!clientId) return;
    this.userListSubscription = this.manageUserService
      .getUsersByClient(clientId)
      .subscribe({
        next: (userList) => {
          this.userList = userList;
          console.log(userList);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
  removeUserFromUserList(user: User) {
    this.userList = this.userList.filter((u) => u.id !== user.id);
  }

  update(id: string) {
    console.log('update', id);
  }
  delete(id: string) {
    console.log('delete', id);
  }
}
