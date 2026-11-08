import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CompanyContextService } from '@services/company-context.service';
import { AuthService } from '@services/auth.service';
import { map, of } from 'rxjs';

/**
 * @description Guard funcional que asegura que el usuario pertenezca a al menos una clínica antes de entrar al módulo clínico.
 */
export const hasCompanyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const companyContext = inject(CompanyContextService);
  const authService = inject(AuthService);

  // Si ya tiene una clínica activa en memoria o localStorage, permitir acceso
  if (companyContext.activeCompany()) {
    return true;
  }

  // Si no hay clínica activa pero hay usuario autenticado, verificar contra la API
  const currentUser = authService.currentUser();
  if (currentUser?.usr_uuid) {
    return companyContext.loadUserCompanies(currentUser.usr_uuid).pipe(
      map((companies) => {
        if (companies && companies.length > 0) {
          return true;
        }
        return router.createUrlTree(['/admin/user/company-onboarding']);
      })
    );
  }

  // Si ni siquiera hay clínicas, derivar a onboarding
  return router.createUrlTree(['/admin/user/company-onboarding']);
};
