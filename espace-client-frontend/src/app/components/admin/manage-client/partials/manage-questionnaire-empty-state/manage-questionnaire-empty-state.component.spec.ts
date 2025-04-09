import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageQuestionnaireEmptyStateComponent } from './manage-questionnaire-empty-state.component';

describe('ManageQuestionnaireEmptyStateComponent', () => {
  let component: ManageQuestionnaireEmptyStateComponent;
  let fixture: ComponentFixture<ManageQuestionnaireEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageQuestionnaireEmptyStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageQuestionnaireEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
