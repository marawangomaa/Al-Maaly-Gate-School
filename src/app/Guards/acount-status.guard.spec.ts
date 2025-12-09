import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { accountStatusGuard } from './acount-status.guard';


describe('acountStatusGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => accountStatusGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
