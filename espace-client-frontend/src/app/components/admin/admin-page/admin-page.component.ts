import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { LoadingService } from '../../../services/loading.service';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-page',
  imports: [RouterOutlet, HeaderComponent, LoadingComponent, ButtonModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent {
  loadingService = inject(LoadingService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  navigateToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
  get showReturnButton(): boolean {
    // Retourne false si la route actuelle est exactement '/admin/dashboard' ou '/admin/dashboard/'
    return !/^\/admin\/dashboard\/?$/.test(this.router.url);
  }
}
