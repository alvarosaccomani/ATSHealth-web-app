import { Injectable, computed, inject, signal } from '@angular/core';
import { CompanyEntity } from '@interfaces/company';
import { UserRolesCompanyService } from '@services/user-roles-company.service';
import { ToastService } from '@services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyContextService {
  private readonly userRolesCompanyService = inject(UserRolesCompanyService);
  private readonly toast = inject(ToastService);

  private readonly _companies = signal<CompanyEntity[]>(this.getStoredCompanies());
  private readonly _activeCompany = signal<CompanyEntity | null>(this.getStoredActiveCompany());
  readonly isLoading = signal<boolean>(false);

  readonly companies = this._companies.asReadonly();
  readonly activeCompany = this._activeCompany.asReadonly();
  readonly activeCmpUuid = computed(() => this._activeCompany()?.cmp_uuid || null);
  readonly hasMultipleCompanies = computed(() => this._companies().length > 1);

  /**
   * @description Carga las clínicas asociadas a un usuario y establece la clínica activa.
   *
   * @param usr_uuid UUID del usuario autenticado.
   */
  loadUserCompanies(usr_uuid: string): void {
    if (!usr_uuid) return;

    this.isLoading.set(true);
    this.userRolesCompanyService.getUserRolesCompanyByUser(usr_uuid).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const data = res?.data;
        if (data && Array.isArray(data)) {
          // Extraer empresas únicas evitando duplicados si el usuario tiene múltiples roles en la misma
          const uniqueMap = new Map<string, CompanyEntity>();
          for (const item of data) {
            if (item.cmp) {
              uniqueMap.set(item.cmp.cmp_uuid, item.cmp);
            }
          }

          const companiesList = Array.from(uniqueMap.values());
          this.setCompanies(companiesList);

          // Si no hay activa o la activa ya no pertenece a la lista, seleccionar la primera
          const currentActive = this._activeCompany();
          if (!currentActive || !uniqueMap.has(currentActive.cmp_uuid)) {
            if (companiesList.length > 0) {
              this.setActiveCompany(companiesList[0]);
            }
          }
        }
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  /**
   * @description Cambia la clínica activa y persiste la elección en el almacenamiento local.
   *
   * @param company Empresa/Clínica a activar.
   */
  setActiveCompany(company: CompanyEntity): void {
    this._activeCompany.set(company);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ats_active_company', JSON.stringify(company));
    }
    this.toast.info(`Clínica activa: ${company.cmp_name}`);
  }

  /**
   * @description Limpia el contexto de clínicas al cerrar sesión.
   */
  clear(): void {
    this._companies.set([]);
    this._activeCompany.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ats_companies');
      localStorage.removeItem('ats_active_company');
    }
  }

  private setCompanies(companies: CompanyEntity[]): void {
    this._companies.set(companies);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ats_companies', JSON.stringify(companies));
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
}
