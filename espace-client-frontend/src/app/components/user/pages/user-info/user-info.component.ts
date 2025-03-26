import { Component } from '@angular/core';
import { ClientComponent } from '../../../shared/client/client.component';

@Component({
  selector: 'app-user-info',
  imports: [ClientComponent],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent {}
