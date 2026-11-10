import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CompanyItemInterface } from '@interfaces/company-item';
import { SingleResult } from '@interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class CompanyItemsService {
  private readonly http = inject(HttpClient);

  readonly companyItems = signal<CompanyItemInterface[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  /**
   * @description Recupera los servicios/ítems médicos asignados a una clínica.
   * @param cmp_uuid Identificador de la empresa/clínica.
   */
  getCompanyItems(cmp_uuid: string): Observable<SingleResult<CompanyItemInterface[]>> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('x-company-uuid', cmp_uuid);

    return this.http
      .get<SingleResult<CompanyItemInterface[]>>(
        `${environment.apiUrl}company-items/${encodeURIComponent(cmp_uuid)}`,
        { headers }
      )
      .pipe(
        tap({
          next: (res) => {
            this.isLoading.set(false);
            const list = res?.data && Array.isArray(res.data) ? res.data : [];
            this.companyItems.set(list);
          },
          error: (err) => {
            this.isLoading.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al consultar los servicios e ítems de la clínica.';
            this.errorMessage.set(msg);
          },
        })
      );
  }
}
