import { TestBed } from '@angular/core/testing';

import { ClassappointmentService } from './classappointment.service';

describe('ClassappointmentService', () => {
  let service: ClassappointmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassappointmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
