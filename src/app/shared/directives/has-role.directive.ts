import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { CompanyContextService } from '@services/company-context.service';

/**
 * @description Directiva estructural para mostrar u ocultar elementos del DOM según el rol en la clínica activa.
 * 
 * Uso:
 * <button *appHasRole="['admin', 'sysadmin']">Solo Admin</button>
 * <div *appHasRole="'admin'">...</div>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly companyContext = inject(CompanyContextService);

  private allowedRoles: string[] = [];
  private isVisible = false;

  @Input() set appHasRole(roles: string | string[]) {
    this.allowedRoles = Array.isArray(roles)
      ? roles.map((r) => r.toLowerCase())
      : [roles.toLowerCase()];
    this.updateView();
  }

  constructor() {
    // Reacciona en tiempo real si el usuario o su rol en la clínica cambia
    effect(() => {
      this.companyContext.currentRole();
      this.updateView();
    });
  }

  private updateView(): void {
    const role = this.companyContext.currentRole();
    const hasPermission = Boolean(role && this.allowedRoles.includes(role));

    if (hasPermission && !this.isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!hasPermission && this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }
}
