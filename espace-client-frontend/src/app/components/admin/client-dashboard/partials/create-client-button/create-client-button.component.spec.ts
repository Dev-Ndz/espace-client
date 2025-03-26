import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateClientButtonComponent } from './create-client-button.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('CreateClientButtonComponent', () => {
  let component: CreateClientButtonComponent;
  let fixture: ComponentFixture<CreateClientButtonComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Créer un espion pour le Router
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ButtonModule, CreateClientButtonComponent, RouterTestingModule], // RouterTestingModule pour simuler la navigation
      declarations: [],
      providers: [
        { provide: Router, useValue: routerSpy }, // Fournir l'espion au lieu de l'instance réelle
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateClientButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to "admin/client/new" on button click', () => {
    // Simuler le clic sur le bouton
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);

    // Vérifier que navigate a été appelé avec les bons paramètres
    expect(routerSpy.navigate).toHaveBeenCalledWith(['admin/client', 'new']);
  });
});
