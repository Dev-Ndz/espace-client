import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClientFormModeService {
  mode = signal<'new' | 'edit' | 'view'>('view');

  switchMode() {
    if (this.mode() === 'edit') {
      this.mode.set('view');
    } else if (this.mode() === 'view') {
      this.mode.set('edit');
    }
  }
}
