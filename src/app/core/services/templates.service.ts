import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  TemplateCreateInput,
  TemplateInterface,
  TemplateSingleResult,
  TemplateUpdateInput,
} from '@interfaces/template';
import { SingleResult } from '@interfaces/common';
import { PELVI_EVAL_V3_PRESET } from './presets/pelvi-eval-v3.preset';

@Injectable({
  providedIn: 'root',
})
export class TemplatesService {
  private readonly http = inject(HttpClient);

  readonly templates = signal<TemplateInterface[]>([]);
  readonly activeTemplate = signal<TemplateInterface | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
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
   * @description Crea una nueva plantilla personalizada en la clínica.
   */
  createTemplate(payload: TemplateCreateInput): Observable<TemplateSingleResult> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('x-company-uuid', payload.cmp_uuid);

    return this.http
      .post<TemplateSingleResult>(
        `${environment.apiUrl}template?cmp_uuid=${encodeURIComponent(payload.cmp_uuid)}`,
        payload,
        { headers }
      )
      .pipe(
        tap({
          next: (res) => {
            this.isSaving.set(false);
            if (res?.data) {
              this.templates.update((list) => [res.data, ...list]);
              this.activeTemplate.set(res.data);
            }
          },
          error: (err) => {
            this.isSaving.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al crear la plantilla clínica.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Actualiza una plantilla existente en la clínica.
   */
  updateTemplate(
    tpl_uuid: string,
    cmp_uuid: string,
    payload: TemplateUpdateInput
  ): Observable<TemplateSingleResult> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('x-company-uuid', cmp_uuid);

    const body = { ...payload, cmp_uuid };

    return this.http
      .put<TemplateSingleResult>(
        `${environment.apiUrl}template/${tpl_uuid}?cmp_uuid=${encodeURIComponent(cmp_uuid)}`,
        body,
        { headers }
      )
      .pipe(
        tap({
          next: (res) => {
            this.isSaving.set(false);
            if (res?.data) {
              this.templates.update((list) =>
                list.map((t) => (t.tpl_uuid === res.data.tpl_uuid ? res.data : t))
              );
              if (this.activeTemplate()?.tpl_uuid === res.data.tpl_uuid) {
                this.activeTemplate.set(res.data);
              }
            }
          },
          error: (err) => {
            this.isSaving.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al actualizar la plantilla clínica.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Elimina o desactiva una plantilla clínica.
   */
  deleteTemplate(tpl_uuid: string, cmp_uuid: string): Observable<SingleResult<any>> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('x-company-uuid', cmp_uuid);

    return this.http
      .delete<SingleResult<any>>(
        `${environment.apiUrl}template/${tpl_uuid}?cmp_uuid=${encodeURIComponent(cmp_uuid)}`,
        { headers }
      )
      .pipe(
        tap({
          next: () => {
            this.isLoading.set(false);
            this.templates.update((list) => list.filter((t) => t.tpl_uuid !== tpl_uuid));
            if (this.activeTemplate()?.tpl_uuid === tpl_uuid) {
              const remaining = this.templates();
              this.activeTemplate.set(remaining.length > 0 ? remaining[0] : null);
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al eliminar la plantilla clínica.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Esquemas predefinidos base para inicializar plantillas clínicas.
   */
  getPresetSchema(presetKey: string): { name: string; code: string; version: string; schema: Record<string, any> } {
    if (presetKey === 'traumatologia') {
      return {
        name: 'Kinesiología & Traumatología Funcional',
        code: 'TRAUMA_EVAL',
        version: '1.0.0',
        schema: {
          stages: [
            {
              id: 'stage_trauma_anamnesis',
              stepNumber: 1,
              title: 'Anamnesis Lesional',
              description: 'Mecanismo de lesión, dolor EVA y rango articular',
              sections: [
                {
                  id: 'sec_injury_core',
                  title: 'Filiación & Motivo Lesional',
                  icon: 'fa-bone',
                  columns: 2,
                  fields: [
                    { id: 'injury_zone', label: 'Región Anatómica', type: 'text', defaultValue: 'Rodilla derecha' },
                    { id: 'eva_score', label: 'Escala EVA (0 a 10)', type: 'number', defaultValue: 6 },
                  ],
                },
              ],
            },
          ],
        },
      };
    }

    if (presetKey === 'cardiologia') {
      return {
        name: 'Cardiología & Riesgo Cardiovascular',
        code: 'CARDIO_EVAL',
        version: '1.0.0',
        schema: {
          stages: [
            {
              id: 'stage_cardio_anamnesis',
              stepNumber: 1,
              title: 'Perfil Hemodinámico',
              description: 'Tensión arterial, factores de riesgo y score SCORE2',
              sections: [
                {
                  id: 'sec_hemo_core',
                  title: 'Signos Vitales & Tensión',
                  icon: 'fa-heart-pulse',
                  columns: 2,
                  fields: [
                    { id: 'bp_systolic', label: 'Presión Sistólica (mmHg)', type: 'number', defaultValue: 120 },
                    { id: 'bp_diastolic', label: 'Presión Diastólica (mmHg)', type: 'number', defaultValue: 80 },
                  ],
                },
              ],
            },
          ],
        },
      };
    }

    // Default: Fisioterapia & Rehabilitación de Piso Pélvico (V3 Enriquecida)
    return {
      name: PELVI_EVAL_V3_PRESET.name,
      code: PELVI_EVAL_V3_PRESET.code,
      version: PELVI_EVAL_V3_PRESET.version,
      schema: PELVI_EVAL_V3_PRESET as Record<string, any>,
    };
  }

}