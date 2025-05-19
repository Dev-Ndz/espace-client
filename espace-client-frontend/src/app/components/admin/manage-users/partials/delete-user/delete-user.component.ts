import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ManageUserService } from '../../../../../services/manage-user.service';
import { User } from '../../../../../models/user';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-delete-user',
  imports: [ButtonModule, DialogModule, ToastModule],
  providers: [MessageService],
  templateUrl: './delete-user.component.html',
  styleUrl: './delete-user.component.scss',
})
export class DeleteUserComponent {
  manageUser = inject(ManageUserService);
  messageService = inject(MessageService);
  @Input() user!: User;
  @Output() userDeleted = new EventEmitter<User>();
  visible = false;

  showDialog() {
    this.visible = true;
  }
  delete() {
    this.manageUser.delete(this.user.id).subscribe({
      next: (user: User) => {
        this.userDeleted.emit(user);
        this.visible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: "L'utilisateur a été supprimé avec succès",
        });
      },
      error: (err) => {
        console.error(err);
        this.visible = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete user',
        });
      },
    });
  }
}
