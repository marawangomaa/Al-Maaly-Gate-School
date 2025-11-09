import { TestBed } from '@angular/core/testing';

import { ClassAppointmentsService } from './class-appointments.service';

describe('ClassAppointmentsService', () => {
  let service: ClassAppointmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassAppointmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
