import { Component } from '@angular/core';
import { HealthStatus } from './health/health-status';

@Component({
  imports: [HealthStatus],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
