import { CanActivateFn } from '@angular/router';

export const hasCompanyGuard: CanActivateFn = (route, state) => {
  return true;
};
