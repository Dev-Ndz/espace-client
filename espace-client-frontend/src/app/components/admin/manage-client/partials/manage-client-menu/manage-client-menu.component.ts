import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-manage-client-menu',
  imports: [MenuModule],
  templateUrl: './manage-client-menu.component.html',
  styleUrl: './manage-client-menu.component.scss',
})
export class ManageClientMenuComponent {
  menuItems: MenuItem[] = [
    { label: 'données', routerLink: 'info' },
    { label: 'questionnaire', routerLink: 'questionnaire' },
    { label: 'utilisateurs', routerLink: 'users' },
  ];
}
