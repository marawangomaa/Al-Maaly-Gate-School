import { TestBed } from '@angular/core/testing';

import { AfterAuthService } from './after-auth.service';

describe('AfterAuthService', () => {
  let service: AfterAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AfterAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
