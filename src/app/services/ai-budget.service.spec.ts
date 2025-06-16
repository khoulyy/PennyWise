import { TestBed } from '@angular/core/testing';

import { AiBudgetService } from './ai-budget.service';

describe('AiBudgetService', () => {
  let service: AiBudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiBudgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
