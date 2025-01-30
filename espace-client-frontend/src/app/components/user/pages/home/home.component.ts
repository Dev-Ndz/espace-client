import { Component } from '@angular/core';
import { AboutComponent } from './partials/about/about.component';
import { ShootingInfoComponent } from './partials/shooting-info/shooting-info.component';
import { WorkflowComponent } from './partials/workflow/workflow.component';

@Component({
  selector: 'app-home',
  imports: [AboutComponent, ShootingInfoComponent, WorkflowComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
