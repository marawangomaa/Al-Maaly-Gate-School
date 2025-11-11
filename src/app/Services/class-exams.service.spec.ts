import { TestBed } from '@angular/core/testing';

import { ClassExamsService } from './class-exams.service';

describe('ClassExamsService', () => {
  let service: ClassExamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassExamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
