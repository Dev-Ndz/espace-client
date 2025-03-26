import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { LoadingService } from '../../../services/loading.service';
import { LoadingComponent } from "../../shared/loading/loading.component";

@Component({
  selector: 'app-admin-page',
  imports: [RouterOutlet, HeaderComponent, LoadingComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent {
  loadingService = inject(LoadingService);
}
