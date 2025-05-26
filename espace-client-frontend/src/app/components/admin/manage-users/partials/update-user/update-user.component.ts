import { Component, inject, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '../../../../../models/user';
import { ManageUserService } from '../../../../../services/manage-user.service';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-update-user',
  imports: [
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.scss',
})
export class UpdateUserComponent {
  manageUser = inject(ManageUserService);
  messageService = inject(MessageService);
  @Input() user!: User;
  visible = false;
  email = '';

  showDialog() {
    this.visible = true;
    this.email = this.user.email;
  }
  update() {
    this.manageUser
      .update(this.user.id, { ...this.user, email: this.email })
      .subscribe({
        next: (user) => {
          this.user.email = user.email;
          this.visible = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User updated successfully',
          });
        },
        error: (err) => {
          console.error(err);
          this.visible = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update user',
          });
        },
      });
  }
}
