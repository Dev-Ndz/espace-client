import { TestBed } from '@angular/core/testing';

import { QuestionnaireModeService } from './questionnaire-mode.service';

describe('QuestionnaireModeService', () => {
  let service: QuestionnaireModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionnaireModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
