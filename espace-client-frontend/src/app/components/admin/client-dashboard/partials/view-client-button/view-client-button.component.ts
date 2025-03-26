import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Client } from '../../../../../models/client';

@Component({
  selector: 'app-view-client-button',
  imports: [ButtonModule],
  templateUrl: './view-client-button.component.html',
  styleUrl: './view-client-button.component.scss',
})
export class ViewClientButtonComponent {
  @Input() client!: Client;
  router = inject(Router);
  viewClient() {
    this.router.navigate(['admin/client', 'view', this.client.id]);
  }
}
