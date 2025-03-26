import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../../../../models/client';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-client-form',
  imports: [
    ButtonModule,
    CheckboxModule,
    ReactiveFormsModule,
    InputTextModule,
    CheckboxModule,
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
})
export class ClientFormComponent implements OnChanges {
  @Input() client?: Client;
  @Output() clientFormEmiter = new EventEmitter<Client>();
  loading = false;
  private fb = inject(FormBuilder);
  clientForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    logo: [''],
    address: [''],
    TVA: [false],
    TVANumber: [''],
    email: ['', [Validators.email]],
    phone: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && changes['client'].currentValue) {
      this.populateForm();
    }
  }
  private populateForm(): void {
    this.clientForm.patchValue(this.client || {});
  }
  onSubmit() {
    if (this.clientForm.valid) {
      this.clientFormEmiter.emit(this.clientForm.value as Client);
    }
  }
}
