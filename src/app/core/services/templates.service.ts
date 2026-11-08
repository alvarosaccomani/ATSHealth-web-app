import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TemplateInterface, TemplateSingleResult } from '@interfaces/template';
import { SingleResult } from '@interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class TemplatesService {
  private readonly http = inject(HttpClient);

  readonly templates = signal<TemplateInterface[]>([]);
  readonly activeTemplate = signal<TemplateInterface | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  /**
   * @description Selecciona manualmente la plantilla clínica activa.
   */
  selectTemplate(template: TemplateInterface | null): void {
    this.activeTemplate.set(template);
  }

  /**
   * @description Recupera las plantillas operativas disponibles para la clínica.
   */
  getTemplates(cmp_uuid: string): Observable<SingleResult<TemplateInterface[]>> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('x-company-uuid', cmp_uuid);

    return this.http
      .get<SingleResult<TemplateInterface[]>>(
        `${environment.apiUrl}templates?cmp_uuid=${encodeURIComponent(cmp_uuid)}`,
        { headers }
      )
      .pipe(
        tap({
          next: (res) => {
            this.isLoading.set(false);
            const list = res?.data && Array.isArray(res.data) ? res.data : [];
            this.templates.set(list);

            // Auto-selección: si no hay activa, prioriza 'PELVI_EVAL' o la primera activa
            if (!this.activeTemplate() && list.length > 0) {
              const defaultTpl =
                list.find((t) => t.tpl_code === 'PELVI_EVAL' && t.tpl_isactive) ||
                list.find((t) => t.tpl_isactive) ||
                list[0];
              this.activeTemplate.set(defaultTpl);
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al consultar las plantillas de la clínica.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Obtiene el detalle de una plantilla por su UUID.
   */
  getTemplateById(tpl_uuid: string, cmp_uuid: string): Observable<TemplateSingleResult> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('x-company-uuid', cmp_uuid);

    return this.http
      .get<TemplateSingleResult>(
        `${environment.apiUrl}template/${tpl_uuid}?cmp_uuid=${encodeURIComponent(cmp_uuid)}`,
        { headers }
      )
      .pipe(
        tap({
          next: (res) => {
            this.isLoading.set(false);
            if (res?.data) {
              this.activeTemplate.set(res.data);
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al obtener la plantilla clínica.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Obtiene una plantilla de la clínica por su código nemotécnico.
   */
  getTemplateByCode(tpl_code: string, cmp_uuid: string): Observable<TemplateSingleResult> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('x-company-uuid', cmp_uuid);

    return this.http
      .get<TemplateSingleResult>(
        `${environment.apiUrl}template/code/${tpl_code}?cmp_uuid=${encodeURIComponent(cmp_uuid)}`,
        { headers }
      )
      .pipe(
        tap({
          next: (res) => {
            this.isLoading.set(false);
            if (res?.data) {
              this.activeTemplate.set(res.data);
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al obtener la plantilla clínica por código.';
            this.errorMessage.set(msg);
          },
        })
      );
  }
}
