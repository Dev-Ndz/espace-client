import { Component, inject } from '@angular/core';
import { ClientService } from '../../../../../../services/client.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private clientService = inject(ClientService);
  description?: string;
  isLoading = false;

  getDescription() {

  }
}
