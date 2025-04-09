import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadQuestionnaireComponent } from './read-questionnaire.component';

describe('ReadQuestionnaireComponent', () => {
  let component: ReadQuestionnaireComponent;
  let fixture: ComponentFixture<ReadQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadQuestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
