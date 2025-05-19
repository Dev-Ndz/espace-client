import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-admin-or-user',
  imports: [TagModule],
  templateUrl: './admin-or-user.component.html',
  styleUrl: './admin-or-user.component.scss',
})
export class AdminOrUserComponent implements OnInit {
  authService = inject(AuthService);
  isAdmin = false;

  ngOnInit() {
    this.authService.isAdmin().subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
    });
  }
}
