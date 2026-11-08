import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CompanyContextService } from '@services/company-context.service';
import { ToastService } from '@services/toast.service';

/**
 * @description Guard funcional que restringe el acceso a rutas exclusivas para administradores de la clínica.
 */
export const adminRoleGuard: CanActivateFn = () => {
  const router = inject(Router);
  const companyContext = inject(CompanyContextService);
  const toast = inject(ToastService);

  if (companyContext.isAdmin()) {
    return true;
  }

  toast.warning('Acceso restringido: Se requieren permisos de administrador en esta clínica.');
  return router.createUrlTree(['/admin/user/patients']);
};
