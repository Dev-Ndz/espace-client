import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQuestionnaireComponent } from './admin-questionnaire.component';

describe('AdminQuestionnaireComponent', () => {
  let component: AdminQuestionnaireComponent;
  let fixture: ComponentFixture<AdminQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminQuestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
