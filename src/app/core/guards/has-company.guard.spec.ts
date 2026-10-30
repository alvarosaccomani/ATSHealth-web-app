import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { hasCompanyGuard } from './has-company.guard';

describe('hasCompanyGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => hasCompanyGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
