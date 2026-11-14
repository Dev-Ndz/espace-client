import { Component } from '@angular/core';
import { HealthStatus } from './health/health-status';

@Component({
  imports: [HealthStatus],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
