import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CreateItemDto,
  ItemInterface,
  ItemResults,
  ItemSingleResult,
  UpdateItemDto,
} from '@interfaces/item';
import { SingleResult } from '@interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private readonly http = inject(HttpClient);

  readonly items = signal<ItemInterface[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  /**
   * @description Recupera la lista paginada de ítems maestros del sistema.
   */
  getItems(
    filter: string = '',
    page: number = 1,
    perPage: number = 100
  ): Observable<SingleResult<ItemInterface[]> | ItemResults | any> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();
    if (filter) {
      params = params.set('filter', filter);
    }
    if (page) {
      params = params.set('page', page.toString());
    }
    if (perPage) {
      params = params.set('perPage', perPage.toString());
    }

    return this.http.get<any>(`${environment.apiUrl}items`, { headers, params }).pipe(
      tap({
        next: (res) => {
          this.isLoading.set(false);
          const list: ItemInterface[] =
            res?.data && Array.isArray(res.data)
              ? res.data
              : Array.isArray(res)
              ? res
              : [];
          this.items.set(list);
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg =
            err?.error?.message ||
            err?.message ||
            'Error al consultar el catálogo maestro de ítems.';
          this.errorMessage.set(msg);
        },
      })
    );
  }

  /**
   * @description Recupera un ítem maestro por su UUID.
   */
  getItemById(itm_uuid: string): Observable<ItemSingleResult> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this.http.get<ItemSingleResult>(
      `${environment.apiUrl}item/${encodeURIComponent(itm_uuid)}`,
      { headers }
    );
  }

  /**
   * @description Crea un nuevo ítem en el catálogo maestro general.
   */
  createItem(payload: CreateItemDto): Observable<ItemSingleResult> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders().set('content-type', 'application/json');

    return this.http
      .post<ItemSingleResult>(`${environment.apiUrl}item`, payload, { headers })
      .pipe(
        tap({
          next: (res) => {
            this.isSaving.set(false);
            if (res?.data) {
              this.items.update((list) => [res.data, ...list]);
            }
          },
          error: (err) => {
            this.isSaving.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al registrar el ítem en el catálogo maestro.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Actualiza un ítem del catálogo maestro.
   */
  updateItem(itm_uuid: string, payload: UpdateItemDto): Observable<ItemSingleResult> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders().set('content-type', 'application/json');

    return this.http
      .put<ItemSingleResult>(
        `${environment.apiUrl}item/${encodeURIComponent(itm_uuid)}`,
        payload,
        { headers }
      )
      .pipe(
        tap({
          next: (res) => {
            this.isSaving.set(false);
            if (res?.data) {
              this.items.update((list) =>
                list.map((i) => (i.itm_uuid === itm_uuid ? res.data : i))
              );
            }
          },
          error: (err) => {
            this.isSaving.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al actualizar el ítem del catálogo.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Elimina un ítem del catálogo maestro general.
   */
  deleteItem(itm_uuid: string): Observable<SingleResult<any>> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders().set('content-type', 'application/json');

    return this.http
      .delete<SingleResult<any>>(
        `${environment.apiUrl}item/${encodeURIComponent(itm_uuid)}`,
        { headers }
      )
      .pipe(
        tap({
          next: () => {
            this.isSaving.set(false);
            this.items.update((list) => list.filter((i) => i.itm_uuid !== itm_uuid));
          },
          error: (err) => {
            this.isSaving.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al eliminar el ítem del catálogo.';
            this.errorMessage.set(msg);
          },
        })
      );
  }
}

