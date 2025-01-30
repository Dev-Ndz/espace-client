import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-navigation',
  imports: [MenuModule, ButtonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {

  menuItems: MenuItem[] = [
    { label: 'overview', routerLink: 'home' },
    { label: 'données', routerLink: 'data' },
    { label: 'documents', routerLink: 'documents' },
    { label: 'moodboard', routerLink: 'moodboard' },
    { label: 'questionnaire', routerLink: 'questionnaire' },
  ];
}
