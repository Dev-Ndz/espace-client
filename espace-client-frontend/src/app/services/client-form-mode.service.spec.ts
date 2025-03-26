import { TestBed } from '@angular/core/testing';

import { ClientFormModeService } from './client-form-mode.service';

describe('ClientFormModeService', () => {
  let service: ClientFormModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientFormModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
