import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientActionButtonComponent } from './client-action-button.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { ClientService } from '../../../../../services/client.service';
// import { LoadingService } from '../../../../../services/loading.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { ClientFormModeService } from '../../../../../services/client-form-mode.service';
import { signal } from '@angular/core';

describe('ClientActionButtonComponent', () => {
  let component: ClientActionButtonComponent;
  let fixture: ComponentFixture<ClientActionButtonComponent>;
  let clientServiceSpy: jasmine.SpyObj<ClientService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let modeServiceMock: jasmine.SpyObj<ClientFormModeService>;
  // let loadingServiceSpy: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    modeServiceMock = jasmine.createSpyObj('ClientFormModeService', ['set'], {
      mode: signal('new'),
    });

    clientServiceSpy = jasmine.createSpyObj('ClientService', [
      'deleteClient',
      'clients',
      'removeClientFromClientsList',
    ]);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    // loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['loading']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MenuModule,
        ButtonModule,
        ClientActionButtonComponent,
      ],
      declarations: [],
      providers: [
        { provide: ClientService, useValue: clientServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ClientFormModeService, useValue: modeServiceMock },
        // { provide: LoadingService, useValue: loadingServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientActionButtonComponent);
    component = fixture.componentInstance;
    component.clientId = '123';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display menu items', () => {
    expect(component.items.length).toBe(3);
    expect(component.items[0].label).toBe('modifier');
    expect(component.items[1].label).toBe('ajouter un utilisateur');
    expect(component.items[2].label).toBe('supprimer');
  });

  it('should navigate to edit client page', () => {
    const routerSpy = spyOn(component.router, 'navigate');
    component.editClient();
    expect(modeServiceMock.mode()).toBe('edit');
    expect(routerSpy).toHaveBeenCalledWith(['admin/client', '123']);
  });

  it('should call deleteClient and update clients list on success', () => {
    clientServiceSpy.deleteClient.and.returnValue(
      of({ id: '123', TVA: false })
    );
    component.deleteClient();
    expect(clientServiceSpy.deleteClient).toHaveBeenCalledWith('123');
    expect(clientServiceSpy.removeClientFromClientsList).toHaveBeenCalledWith(
      '123'
    );
  });

  it('should handle error on deleteClient and show error message', () => {
    clientServiceSpy.deleteClient.and.returnValue(
      throwError(() => new Error('Erreur serveur'))
    );
    component.deleteClient();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Erreur lors de la suppression du client',
    });
  });

  it('should call createUserComponent if defined', () => {
    component.createUserComponent = jasmine.createSpyObj(
      'CreateUserComponent',
      ['generateLink']
    );
    component.createUser();
    expect(component.createUserComponent.generateLink).toHaveBeenCalledWith(
      '123'
    );
  });
});
