import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewClientButtonComponent } from './view-client-button.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ButtonModule } from 'primeng/button';

describe('ViewClientButtonComponent', () => {
  let component: ViewClientButtonComponent;
  let fixture: ComponentFixture<ViewClientButtonComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ButtonModule, ViewClientButtonComponent],
      declarations: [],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewClientButtonComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    // Simulation d'un client en entrée
    component.client = { id: '1', name: 'Client Test', TVA: false };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the client name', () => {
    const buttonElement: HTMLElement =
      fixture.nativeElement.querySelector('p-button');
    expect(buttonElement.textContent?.trim()).toContain('Client Test');
  });

  it('should navigate to client view on button click', () => {
    const navigateSpy = spyOn(router, 'navigate');

    const buttonElement: HTMLElement =
      fixture.nativeElement.querySelector('p-button');
    buttonElement.dispatchEvent(new Event('click'));

    expect(navigateSpy).toHaveBeenCalledWith(['admin/client', 'view', '1']);
  });
});
