import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ItemInterface, ItemResults, ItemSingleResult } from '@interfaces/item';
import { SingleResult } from '@interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private readonly http = inject(HttpClient);

  /**
   * @description Recupera la lista paginada de ítems maestros del sistema.
   */
  getItems(
    filter: string = '',
    page: number = 1,
    perPage: number = 100
  ): Observable<SingleResult<ItemInterface[]> | ItemResults | any> {
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

    return this.http.get<any>(`${environment.apiUrl}items`, { headers, params });
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
}
