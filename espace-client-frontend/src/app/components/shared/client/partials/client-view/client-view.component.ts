import { Component, Input } from '@angular/core';
import { Client } from '../../../../../models/client';

@Component({
  selector: 'app-client-view',
  imports: [],
  templateUrl: './client-view.component.html',
  styleUrl: './client-view.component.scss',
})
export class ClientViewComponent {
  @Input() client?: Client;
}
