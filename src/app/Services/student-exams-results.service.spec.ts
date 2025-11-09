import { TestBed } from '@angular/core/testing';

import { StudentExamsResultsService } from './student-exams-results.service';

describe('StudentExamsResultsService', () => {
  let service: StudentExamsResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentExamsResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
