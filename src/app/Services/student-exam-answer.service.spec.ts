import { TestBed } from '@angular/core/testing';

import { StudentExamAnswerService } from './student-exam-answer.service';

describe('StudentExamAnswerService', () => {
  let service: StudentExamAnswerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentExamAnswerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
