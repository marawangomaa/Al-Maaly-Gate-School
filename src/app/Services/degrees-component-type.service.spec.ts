import { TestBed } from '@angular/core/testing';

import { DegreesComponentTypeService } from './degrees-component-type.service';

describe('DegreesComponentTypeService', () => {
  let service: DegreesComponentTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DegreesComponentTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
