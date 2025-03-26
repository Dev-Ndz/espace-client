import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientDashboardComponent } from './client-dashboard.component';
import { ClientService } from '../../../services/client.service';
import { MessageService } from 'primeng/api';

import { Client } from '../../../models/client';
import { CreateClientButtonComponent } from './partials/create-client-button/create-client-button.component';
import { ViewClientButtonComponent } from './partials/view-client-button/view-client-button.component';
import { ClientActionButtonComponent } from './partials/client-action-button/client-action-button.component';
import { provideHttpClient } from '@angular/common/http';

describe('ClientDashboardComponent', () => {
  let component: ClientDashboardComponent;
  let fixture: ComponentFixture<ClientDashboardComponent>;
  let mockClientService: jasmine.SpyObj<ClientService>;

  const mockClients: Client[] = [
    {
      id: 'a',
      name: 'Client A',
      TVA: false,
    },
    {
      id: 'b',
      name: 'Client B',
      TVA: false,
    },
  ];

  beforeEach(async () => {
    mockClientService = jasmine.createSpyObj('ClientService', [
      'getAllClients',
      'clients',
    ]);
    mockClientService.clients.and.returnValue(mockClients);

    await TestBed.configureTestingModule({
      declarations: [],
      providers: [
        { provide: ClientService, useValue: mockClientService },
        MessageService,
        provideHttpClient,
      ],
      imports: [
        ClientDashboardComponent,
        CreateClientButtonComponent,
        ViewClientButtonComponent,
        ClientActionButtonComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('devrait appeler clientService.getAllClients() au démarrage', () => {
    expect(mockClientService.getAllClients).toHaveBeenCalled();
  });

  it('devrait afficher la liste des clients', () => {
    const clientElements = fixture.nativeElement.querySelectorAll(
      'app-view-client-button'
    );
    expect(clientElements.length).toBe(mockClients.length);
  });

  it('devrait afficher le bouton de création de client', () => {
    const createButton = fixture.nativeElement.querySelector(
      'app-create-client-button'
    );
    expect(createButton).toBeTruthy();
  });
});
