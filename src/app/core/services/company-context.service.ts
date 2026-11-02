import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { CompanyEntity } from '@interfaces/company';
import { UserRolesCompanyService } from '@services/user-roles-company.service';
import { ToastService } from '@services/toast.service';
import { UserRolCompanyInterface } from '@interfaces/user-rol-company';

@Injectable({
  providedIn: 'root',
})
export class CompanyContextService {
  private readonly userRolesCompanyService = inject(UserRolesCompanyService);
  private readonly toast = inject(ToastService);

  private readonly _companies = signal<CompanyEntity[]>(this.getStoredCompanies());
  private readonly _activeCompany = signal<CompanyEntity | null>(this.getStoredActiveCompany());
  private readonly _userRoles = signal<UserRolCompanyInterface[]>(this.getStoredUserRoles());
  readonly isLoading = signal<boolean>(false);

  readonly companies = this._companies.asReadonly();
  readonly activeCompany = this._activeCompany.asReadonly();
  readonly userRoles = this._userRoles.asReadonly();
  readonly activeCmpUuid = computed(() => this._activeCompany()?.cmp_uuid || null);
  readonly hasMultipleCompanies = computed(() => this._companies().length > 1);

  /**
   * @description Rol actual del usuario en la clínica activa ('admin' | 'sysadmin' | 'profesional', etc.).
   */
  readonly currentRole = computed<string | null>(() => {
    const activeUuid = this.activeCmpUuid();
    if (!activeUuid) return null;
    const match = this._userRoles().find((ur) => ur.cmp_uuid === activeUuid);
    return match?.rol?.rol_name?.toLowerCase() || null;
  });

  /**
   * @description Determina si el usuario posee rol administrativo en la clínica activa.
   */
  readonly isAdmin = computed<boolean>(() => {
    const role = this.currentRole();
    return role === 'admin' || role === 'sysadmin';
  });

  /**
   * @description Determina si el usuario tiene rol de profesional clínico en la clínica activa.
   */
  readonly isProfessional = computed<boolean>(() => {
    const role = this.currentRole();
    return role === 'profesional' || role === 'admin' || role === 'sysadmin';
  });

  /**
   * @description Carga las clínicas asociadas a un usuario y sus roles, estableciendo la clínica activa.
   *
   * @param usr_uuid UUID del usuario autenticado.
   * @returns Observable con la lista de clínicas obtenidas.
   */
  loadUserCompanies(usr_uuid: string): Observable<CompanyEntity[]> {
    if (!usr_uuid) return of([]);

    this.isLoading.set(true);
    return this.userRolesCompanyService.getUserRolesCompanyByUser(usr_uuid).pipe(
      map((res) => {
        this.isLoading.set(false);
        const data = res?.data;
        if (data && Array.isArray(data)) {
          this.setUserRoles(data);

          const uniqueMap = new Map<string, CompanyEntity>();
          for (const item of data) {
            if (item.cmp) {
              uniqueMap.set(item.cmp.cmp_uuid, item.cmp);
            }
          }

          const companiesList = Array.from(uniqueMap.values());
          this.setCompanies(companiesList);

          const currentActive = this._activeCompany();
          if (!currentActive || !uniqueMap.has(currentActive.cmp_uuid)) {
            if (companiesList.length > 0) {
              this.setActiveCompany(companiesList[0], false);
            } else {
              this._activeCompany.set(null);
            }
          }
          return companiesList;
        }
        this.setUserRoles([]);
        this.setCompanies([]);
        this._activeCompany.set(null);
        return [];
      }),
      tap({
        error: () => {
          this.isLoading.set(false);
        },
      })
    );
  }

  /**
   * @description Cambia la clínica activa y persiste la elección en el almacenamiento local.
   *
   * @param company Empresa/Clínica a activar.
   * @param notify Muestra o no toast informativo.
   */
  setActiveCompany(company: CompanyEntity, notify = true): void {
    this._activeCompany.set(company);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ats_active_company', JSON.stringify(company));
    }
    if (notify) {
      this.toast.info(`Clínica activa: ${company.cmp_name}`);
    }
  }

  /**
   * @description Limpia el contexto de clínicas y roles al cerrar sesión.
   */
  clear(): void {
    this._companies.set([]);
    this._activeCompany.set(null);
    this._userRoles.set([]);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ats_companies');
      localStorage.removeItem('ats_active_company');
      localStorage.removeItem('ats_user_roles');
    }
  }

  private setCompanies(companies: CompanyEntity[]): void {
    this._companies.set(companies);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ats_companies', JSON.stringify(companies));
    }
  }

  private setUserRoles(roles: UserRolCompanyInterface[]): void {
    this._userRoles.set(roles);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ats_user_roles', JSON.stringify(roles));
    }
  }

  private getStoredCompanies(): CompanyEntity[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem('ats_companies');
    if (!raw) return [];
    try {
      return JSON.parse(raw) as CompanyEntity[];
    } catch {
      return [];
    }
  }

  private getStoredActiveCompany(): CompanyEntity | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem('ats_active_company');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CompanyEntity;
    } catch {
      return null;
    }
  }

  private getStoredUserRoles(): UserRolCompanyInterface[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem('ats_user_roles');
    if (!raw) return [];
    try {
      return JSON.parse(raw) as UserRolCompanyInterface[];
    } catch {
      return [];
    }
  }
}
