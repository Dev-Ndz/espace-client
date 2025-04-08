import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageClientComponent } from './manage-client.component';
import { ActivatedRoute } from '@angular/router';
import { ClientFormModeService } from '../../../services/client-form-mode.service';
import { ClientService } from '../../../services/client.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

describe('ManageClientComponent', () => {
  let component: ManageClientComponent;
  let fixture: ComponentFixture<ManageClientComponent>;
  let modeServiceMock: jasmine.SpyObj<ClientFormModeService>;
  let clientServiceMock: jasmine.SpyObj<ClientService>;

  beforeEach(async () => {
    modeServiceMock = jasmine.createSpyObj('ClientFormModeService', ['set'], {
      mode: signal('new'),
    });

    clientServiceMock = jasmine.createSpyObj('ClientService', [
      'getClientById',
      'client',
    ]);

    await TestBed.configureTestingModule({
      imports: [ManageClientComponent],
      providers: [
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {},
            },
          },
        },
        { provide: ClientService, useValue: clientServiceMock },
        { provide: ClientFormModeService, useValue: modeServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ne devrait pas appeler clientService.getClientById() si aucun ID n’est fourni', () => {
    expect(clientServiceMock.getClientById).not.toHaveBeenCalled();
  });
  it('devrait appeler clientService.getClientById() si un ID est fourni', () => {
    const routeWithId = TestBed.inject(ActivatedRoute);
    routeWithId.snapshot.params = { id: '123' };
    fixture = TestBed.createComponent(ManageClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(clientServiceMock.getClientById).toHaveBeenCalledWith('123');
  });
});
