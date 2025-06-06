import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuestionnaireComponent } from './view-questionnaire.component';

describe('ViewQuestionnaireComponent', () => {
  let component: ViewQuestionnaireComponent;
  let fixture: ComponentFixture<ViewQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewQuestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
