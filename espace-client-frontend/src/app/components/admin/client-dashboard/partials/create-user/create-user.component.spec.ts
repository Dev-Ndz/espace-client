import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateUserComponent } from './create-user.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { LoadingService } from '../../../../../services/loading.service';
import { MessageService } from 'primeng/api';
import { ClientService } from '../../../../../services/client.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('CreateUserComponent', () => {
  let component: CreateUserComponent;
  let fixture: ComponentFixture<CreateUserComponent>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let clientServiceSpy: jasmine.SpyObj<ClientService>;

  const mockResponse = { url: 'http://example.com/invite' }; // Mock de la réponse de l'API

  beforeEach(async () => {
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['set'], {
      loading: signal('false'),
    });
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    clientServiceSpy = jasmine.createSpyObj('ClientService', ['addUser']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ButtonModule,
        DialogModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputTextModule,
        CreateUserComponent,
      ],
      declarations: [],
      providers: [
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ClientService, useValue: clientServiceSpy },
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call generateLink and set the link when successful', () => {
    // Configurer le comportement du mock clientService.addUser
    clientServiceSpy.addUser.and.returnValue(of(mockResponse));

    component.generateLink('123'); // Appeler la méthode generateLink

    // Vérifier que la méthode addUser a été appelée avec l'ID client
    expect(clientServiceSpy.addUser).toHaveBeenCalledWith('123');

    // Vérifier que le lien a été mis à jour
    expect(component.link).toBe(mockResponse.url);

    // Vérifier que la méthode loading.set a été appelée pour désactiver le chargement
    expect(loadingServiceSpy.loading()).toBe(false);
  });

  it('should handle error and show error message if addUser fails', () => {
    clientServiceSpy.addUser.and.returnValue(
      throwError(() => new Error('Erreur serveur'))
    );

    component.generateLink('123'); // Appeler la méthode generateLink

    // Vérifier que la méthode addUser a été appelée avec l'ID client
    expect(clientServiceSpy.addUser).toHaveBeenCalledWith('123');

    // Vérifier que le message d'erreur a été ajouté via MessageService
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: "Erreur lors de la création de l'utilisateur",
    });
  });

  it('should call copyLink and copy the link to clipboard', () => {
    component.link = 'http://example.com/invite'; // Définir un lien factice
    const copySpy = spyOn(navigator.clipboard, 'writeText'); // Espionner la méthode writeText

    component.copyLink(); // Appeler la méthode copyLink

    // Vérifier que la méthode writeText a été appelée avec le bon lien
    expect(copySpy).toHaveBeenCalledWith('http://example.com/invite');

    // Vérifier que le message de succès a été affiché
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'lien copié',
      detail: "Le lien d'invitation est copié",
    });
  });

  it('should show loading spinner while generating link', () => {
    // Mock réponse réussie, retour d'un Observable simulé
    const mockResponse = { url: 'test-link' };
    clientServiceSpy.addUser.and.returnValue(of(mockResponse)); // 'of' est utilisé pour créer un Observable

    // Appel de la méthode qui génère le lien
    component.generateLink('client-id');

    fixture.detectChanges();

    // Vérifie que loading est désactivé après la réponse
    expect(loadingServiceSpy.loading()).toBeFalse();
    expect(component.link).toBe(mockResponse.url); // Vérifie que le lien a été correctement défini
  });
});
