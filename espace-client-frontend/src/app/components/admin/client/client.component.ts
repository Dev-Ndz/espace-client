import { Component, effect, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-client',
  providers: [MessageService],
  imports: [
    ToastModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    ReactiveFormsModule,
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private activatedRoute = inject(ActivatedRoute);
  public loading = false;
  @Input() inputMode?: 'new' | 'view' | 'edit';
  @Input() userType?: 'USER' | 'ADMIN';
  mode?: 'new' | 'view' | 'edit';
  client?: Client;

  constructor() {
    effect(() => {
      if (this.userType === 'USER') this.client = this.clientService.client();
    });
  }

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
  ngOnInit(): void {
    this.mode = this.activatedRoute.snapshot.params['mode'];
    if (this.inputMode) {
      this.mode = this.inputMode;
    }
    const clientId = this.activatedRoute.snapshot.params['id'];
    if (clientId) {
      this.getClient(clientId);
    }
  }
  getClient(clientId: string) {
    this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client = client;
        if (this.mode === 'edit') {
          this.populateForm();
        }
        console.log(this.client);
      },
      error: (err) => {
        console.error('erreur lors de la récuperation du client', err);
      },
    });
    console.log('client', this.client);
  }
  switchToEdit() {
    this.mode = 'edit';
    this.populateForm();
  }
  populateForm() {
    this.clientForm.patchValue({
      name: this.client?.name,
      description: this.client?.description,
      logo: this.client?.logo,
      address: this.client?.address,
      TVA: this.client?.TVA,
      TVANumber: this.client?.TVANumber,
      email: this.client?.email,
      phone: this.client?.phone,
    });
  }
  createClient() {
    if (this.clientForm.valid) {
      this.loading = true;
      this.clientService
        .createClient(this.clientForm.value as Client)
        .subscribe({
          next: (client) => {
            this.clientService.clients.update((clientList) => {
              clientList.push(client);
              return clientList;
            });
            this.loading = false;

            this.router.navigate(['admin/client-dashboard']);
          },
          error: (err) => {
            console.error('erreur lors de la création du client', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la création du client',
            });
            this.loading = false;
          },
        });
    }
  }

  updateClient() {
    if (this.clientForm.valid) {
      this.loading = true;
      this.clientService
        .updateClient(this.clientForm.value as Client, this.client!.id!)
        .subscribe({
          next: (client) => {
            if (this.userType === 'USER') {
              this.clientService.client.set(client);
              this.mode = 'view';
            } else {
              this.clientService.clients.update((clientList) => {
                clientList.push(client);
                return clientList;
              });
              this.router.navigate(['admin/client-dashboard']);
            }
            this.loading = false;
          },
          error: (err) => {
            console.error('erreur lors de la création du client', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la mise à jour du client',
            });
            this.loading = false;
          },
        });
    }
  }

  onSubmit() {
    if (this.mode === 'new') {
      this.createClient();
    }
    if (this.mode === 'edit') {
      this.updateClient();
    }
  }
}
