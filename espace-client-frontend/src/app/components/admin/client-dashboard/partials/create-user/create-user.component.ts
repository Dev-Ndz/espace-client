import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { LoadingService } from '../../../../../services/loading.service';
import { MessageService } from 'primeng/api';
import { ClientService } from '../../../../../services/client.service';

@Component({
  selector: 'app-create-user',
  imports: [
    ButtonModule,
    DialogModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss',
})
export class CreateUserComponent {
  loadingService = inject(LoadingService);
  messageService = inject(MessageService);
  clientService = inject(ClientService);
  link?: string;
  visible = false;

  copyLink() {
    if (this.link) navigator.clipboard.writeText(this.link);
    this.messageService.add({
      severity: 'success',
      summary: 'lien copié',
      detail: "Le lien d'invitation est copié",
    });
  }
  generateLink(clientId: string) {
    this.loadingService.loading.set(true);
    this.visible = true;
    this.clientService.addUser(clientId).subscribe({
      next: (response) => {
        this.link = response.url;
        console.log('add client', response);
        this.loadingService.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: "Erreur lors de la création de l'utilisateur",
        });
        this.loadingService.loading.set(false);
        this.visible = false;
      },
    });
  }
}
