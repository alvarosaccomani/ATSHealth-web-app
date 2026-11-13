import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AssignCompanyItemDto,
  CompanyItemInterface,
  CompanyItemSingleResult,
} from '@interfaces/company-item';
import { SingleResult } from '@interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class CompanyItemsService {
  private readonly http = inject(HttpClient);

  readonly companyItems = signal<CompanyItemInterface[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
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

  /**
   * @description Asocia un ítem del catálogo maestro a la clínica activa.
   */
  assignCompanyItem(payload: AssignCompanyItemDto): Observable<CompanyItemSingleResult> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('x-company-uuid', payload.cmp_uuid);

    return this.http
      .post<CompanyItemSingleResult>(
        `${environment.apiUrl}company-items?cmp_uuid=${encodeURIComponent(payload.cmp_uuid)}`,
        payload,
        { headers }
      )
      .pipe(
        tap({
          next: (res) => {
            this.isSaving.set(false);
            if (res?.data) {
              this.companyItems.update((list) => [res.data, ...list]);
            }
          },
          error: (err) => {
            this.isSaving.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al vincular el servicio médico a la clínica.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Alias compatible para assignCompanyItem.
   */
  createCompanyItem(payload: AssignCompanyItemDto): Observable<CompanyItemSingleResult> {
    return this.assignCompanyItem(payload);
  }

  /**
   * @description Desvincula o elimina un servicio médico de la clínica.
   */
  deleteCompanyItem(cmpitm_uuid: string, cmp_uuid: string): Observable<SingleResult<any>> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('x-company-uuid', cmp_uuid);

    return this.http
      .delete<SingleResult<any>>(
        `${environment.apiUrl}company-items/${encodeURIComponent(cmpitm_uuid)}?cmp_uuid=${encodeURIComponent(cmp_uuid)}`,
        { headers }
      )
      .pipe(
        tap({
          next: () => {
            this.isSaving.set(false);
            this.companyItems.update((list) =>
              list.filter((item) => item.cmpitm_uuid !== cmpitm_uuid)
            );
          },
          error: (err) => {
            this.isSaving.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al eliminar el servicio médico.';
            this.errorMessage.set(msg);
          },
        })
      );
  }
}


