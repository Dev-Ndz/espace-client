import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // constructor() { }
  loading = signal<boolean>(false);

  
}
