import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageQuestionnaireComponent } from './manage-questionnaire.component';

describe('ManageQuestionnaireComponent', () => {
  let component: ManageQuestionnaireComponent;
  let fixture: ComponentFixture<ManageQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageQuestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
