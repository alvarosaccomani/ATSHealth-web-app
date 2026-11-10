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

    // Default: Fisioterapia & Rehabilitación de Piso Pélvico (completo de OmniForm EHR)
    return {
      name: "Fisioterapia & Rehabilitación de Piso Pélvico",
      code: "PELVI_EVAL",
      version: "2.4.0",
      schema: {
      "templateId": "tpl_pelvic_floor_v2",
      "name": "Fisioterapia & Rehabilitación de Piso Pélvico",
      "specialty": "Uroginecología & Pelviperineología",
      "version": "2.4.0",
      "icon": "fa-person-breastfeeding",
      "stages": [
            {
                  "id": "stage_anamnesis",
                  "stepNumber": 1,
                  "title": "Anamnesis & Tests",
                  "description": "Comorbilidades, cuestionarios validados e ingesta",
                  "sections": [
                        {
                              "id": "sec_patient_core",
                              "title": "Filiación & Motivo Principal",
                              "icon": "fa-user-circle",
                              "columns": 3,
                              "fields": [
                                    {
                                          "id": "biological_sex",
                                          "label": "Sexo Biológico",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "Femenino (Gineco-Obstétrico)",
                                                      "value": "female"
                                                },
                                                {
                                                      "label": "Masculino (Urológico / Andrológico)",
                                                      "value": "male"
                                                }
                                          ],
                                          "defaultValue": "female"
                                    },
                                    {
                                          "id": "consult_reason",
                                          "label": "Motivo Principal de Consulta",
                                          "type": "text",
                                          "defaultValue": "Escapes involuntarios al toser y estornudar en el postparto."
                                    },
                                    {
                                          "id": "physical_job_load",
                                          "label": "Ocupación & Carga Física",
                                          "type": "text",
                                          "defaultValue": "Docente (bipedestación prolongada > 5h/día, esfuerzos vocales)."
                                    }
                              ]
                        },
                        {
                              "id": "sec_preexisting",
                              "title": "Comorbilidades & Factores de Riesgo Sistémicos",
                              "icon": "fa-notes-medical",
                              "columns": 3,
                              "fields": [
                                    {
                                          "id": "chk_diabetes",
                                          "label": "Diabetes Mellitus (I / II / Gestacional)",
                                          "type": "checkbox",
                                          "defaultValue": false
                                    },
                                    {
                                          "id": "chk_laxity",
                                          "label": "Hiperlaxitud Articular (Beighton ≥ 4)",
                                          "type": "checkbox",
                                          "defaultValue": true
                                    },
                                    {
                                          "id": "chk_obesity",
                                          "label": "Sobrepeso / Obesidad (IMC > 27)",
                                          "type": "checkbox",
                                          "defaultValue": true
                                    },
                                    {
                                          "id": "chk_respiratory",
                                          "label": "Asma / Tos Crónica de esfuerzo",
                                          "type": "checkbox",
                                          "defaultValue": false
                                    },
                                    {
                                          "id": "chk_spine",
                                          "label": "Lumbopelvialgia / Hernia Discal previa",
                                          "type": "checkbox",
                                          "defaultValue": true
                                    },
                                    {
                                          "id": "patient_meds",
                                          "label": "Fármacos con impacto en detrusor/colágeno",
                                          "type": "text",
                                          "defaultValue": "Levotiroxina 50mcg. Sin diuréticos."
                                    }
                              ]
                        },
                        {
                              "id": "sec_female_obs",
                              "title": "Rama Obstétrica Femenina",
                              "icon": "fa-baby",
                              "condition": {
                                    "field": "biological_sex",
                                    "operator": "eq",
                                    "value": "female"
                              },
                              "columns": 4,
                              "fields": [
                                    {
                                          "id": "obs_phase",
                                          "label": "Fase Obstétrica Actual",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "Postparto / Puerperio",
                                                      "value": "postpartum"
                                                },
                                                {
                                                      "label": "Preparación al Parto (Preparto)",
                                                      "value": "prebirth"
                                                },
                                                {
                                                      "label": "Ginecología General / Menopausia",
                                                      "value": "none"
                                                }
                                          ],
                                          "defaultValue": "postpartum"
                                    },
                                    {
                                          "id": "obs_parity",
                                          "label": "Partos Vaginales",
                                          "type": "number",
                                          "defaultValue": 1
                                    },
                                    {
                                          "id": "obs_cesarean",
                                          "label": "Cesáreas",
                                          "type": "number",
                                          "defaultValue": 0
                                    },
                                    {
                                          "id": "obs_tear",
                                          "label": "Trauma Perineal Previo",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "Episiotomía M-L",
                                                      "value": "episiotomy"
                                                },
                                                {
                                                      "label": "Desgarro Grado I / II",
                                                      "value": "tear_1_2"
                                                },
                                                {
                                                      "label": "Desgarro Grave III/IV (OASIS)",
                                                      "value": "oasis"
                                                },
                                                {
                                                      "label": "Periné Íntegro",
                                                      "value": "intact"
                                                }
                                          ],
                                          "defaultValue": "episiotomy"
                                    },
                                    {
                                          "id": "postpartum_scar_eva",
                                          "label": "Dolor en Cicatriz Perineal (EVA 0-10)",
                                          "type": "number",
                                          "min": 0,
                                          "max": 10,
                                          "defaultValue": 4,
                                          "condition": {
                                                "field": "obs_phase",
                                                "operator": "eq",
                                                "value": "postpartum"
                                          }
                                    },
                                    {
                                          "id": "prebirth_epino",
                                          "label": "Entrenamiento con Balón Epi-No",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "No iniciado",
                                                      "value": "none"
                                                },
                                                {
                                                      "label": "Iniciado (< 20cm elastancia)",
                                                      "value": "started"
                                                },
                                                {
                                                      "label": "Avanzado (≥ 24cm elastancia)",
                                                      "value": "advanced"
                                                }
                                          ],
                                          "defaultValue": "none",
                                          "condition": {
                                                "field": "obs_phase",
                                                "operator": "eq",
                                                "value": "prebirth"
                                          }
                                    }
                              ]
                        },
                        {
                              "id": "sec_male_urology",
                              "title": "Rama Urológica Masculina",
                              "icon": "fa-mars",
                              "condition": {
                                    "field": "biological_sex",
                                    "operator": "eq",
                                    "value": "male"
                              },
                              "columns": 3,
                              "fields": [
                                    {
                                          "id": "male_surgery",
                                          "label": "Cirugía Prostática Previa",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "Prostatectomía Radical (da Vinci / Robótica)",
                                                      "value": "robotic"
                                                },
                                                {
                                                      "label": "Prostatectomía Abierta",
                                                      "value": "open"
                                                },
                                                {
                                                      "label": "RTU / Enucleación Láser HoLEP",
                                                      "value": "rtu"
                                                },
                                                {
                                                      "label": "Sin Cirugía (Vejiga hiperactiva / Dolor)",
                                                      "value": "none"
                                                }
                                          ],
                                          "defaultValue": "robotic"
                                    },
                                    {
                                          "id": "pad_test_24h",
                                          "label": "Pad Test 24 Horas (Gramos de pérdida)",
                                          "type": "number",
                                          "defaultValue": 85
                                    },
                                    {
                                          "id": "nih_cpsi_score",
                                          "label": "Score Dolor/Molestia NIH-CPSI (0-43)",
                                          "type": "number",
                                          "defaultValue": 14
                                    }
                              ]
                        },
                        {
                              "id": "sec_iciq",
                              "title": "Cuestionario Validado ICIQ-UI SF",
                              "icon": "fa-clipboard-question",
                              "type": "score_card",
                              "scoreId": "iciq_total",
                              "scoreName": "Score ICIQ-UI SF",
                              "maxScore": 21,
                              "columns": 3,
                              "fields": [
                                    {
                                          "id": "iciq_freq",
                                          "label": "1. ¿Con qué frecuencia pierde orina?",
                                          "type": "radio",
                                          "options": [
                                                {
                                                      "label": "Nunca (0)",
                                                      "value": 0
                                                },
                                                {
                                                      "label": "1 vez a la semana o menos (1)",
                                                      "value": 1
                                                },
                                                {
                                                      "label": "2 o 3 veces a la semana (2)",
                                                      "value": 2
                                                },
                                                {
                                                      "label": "1 vez al día (3)",
                                                      "value": 3
                                                },
                                                {
                                                      "label": "Varias veces al día (4)",
                                                      "value": 4
                                                },
                                                {
                                                      "label": "Continuamente (5)",
                                                      "value": 5
                                                }
                                          ],
                                          "defaultValue": 2
                                    },
                                    {
                                          "id": "iciq_vol",
                                          "label": "2. ¿Qué cantidad de orina pierde habitualmente?",
                                          "type": "radio",
                                          "options": [
                                                {
                                                      "label": "No pierde nada (0)",
                                                      "value": 0
                                                },
                                                {
                                                      "label": "Cantidad pequeña / gotas (2)",
                                                      "value": 2
                                                },
                                                {
                                                      "label": "Cantidad moderada (4)",
                                                      "value": 4
                                                },
                                                {
                                                      "label": "Mucha cantidad / empapa ropa (6)",
                                                      "value": 6
                                                }
                                          ],
                                          "defaultValue": 2
                                    },
                                    {
                                          "id": "iciq_impact",
                                          "label": "3. Impacto en su vida cotidiana (0 a 10)",
                                          "type": "range",
                                          "min": 0,
                                          "max": 10,
                                          "defaultValue": 7
                                    }
                              ]
                        },
                        {
                              "id": "sec_bristol_bowel",
                              "title": "Función Intestinal & Escala de Bristol",
                              "icon": "fa-apple-whole",
                              "columns": 2,
                              "fields": [
                                    {
                                          "id": "bristol_scale",
                                          "label": "Tipo en la Escala Visual de Bristol",
                                          "type": "visual_bristol",
                                          "defaultValue": 2
                                    },
                                    {
                                          "id": "constipation_straining",
                                          "label": "Esfuerzo defecatorio excesivo (>25% tiempo)",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "Sí (Pujo intenso habitual)",
                                                      "value": "yes"
                                                },
                                                {
                                                      "label": "No (Evacuación fisiológica sin esfuerzo)",
                                                      "value": "no"
                                                }
                                          ],
                                          "defaultValue": "yes"
                                    }
                              ]
                        },
                        {
                              "id": "sec_bladder_diary",
                              "title": "Diario Miccional Registrado (Balance Hídrico)",
                              "icon": "fa-glass-water-droplet",
                              "type": "table_dynamic",
                              "columns": [
                                    {
                                          "key": "time",
                                          "label": "Hora",
                                          "type": "text"
                                    },
                                    {
                                          "key": "intake",
                                          "label": "Ingesta (ml / Tipo)",
                                          "type": "number"
                                    },
                                    {
                                          "key": "void",
                                          "label": "Volumen Miccional (ml)",
                                          "type": "number"
                                    },
                                    {
                                          "key": "urgency",
                                          "label": "Urgencia (0-3)",
                                          "type": "number"
                                    },
                                    {
                                          "key": "leak",
                                          "label": "¿Escape involuntario?",
                                          "type": "checkbox"
                                    }
                              ],
                              "defaultRows": [
                                    {
                                          "time": "07:30",
                                          "intake": 300,
                                          "void": 350,
                                          "urgency": 0,
                                          "leak": false
                                    },
                                    {
                                          "time": "11:15",
                                          "intake": 500,
                                          "void": 200,
                                          "urgency": 1,
                                          "leak": true
                                    },
                                    {
                                          "time": "15:45",
                                          "intake": 450,
                                          "void": 250,
                                          "urgency": 2,
                                          "leak": true
                                    },
                                    {
                                          "time": "19:30",
                                          "intake": 700,
                                          "void": 300,
                                          "urgency": 1,
                                          "leak": true
                                    }
                              ]
                        },
                        {
                              "id": "sec_consent_upload",
                              "title": "Consentimiento Informado & Archivos Adjuntos",
                              "icon": "fa-file-signature",
                              "type": "file_attachment",
                              "legalScope": "Autorización para palpación intracavitaria, biofeedback y electroestimulación.",
                              "fields": [
                                    {
                                          "id": "consent_status",
                                          "label": "Estado Médico-Legal",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "Firmado en consulta presencial",
                                                      "value": "signed"
                                                },
                                                {
                                                      "label": "Firma digital verificada",
                                                      "value": "digital"
                                                },
                                                {
                                                      "label": "Pendiente de firma",
                                                      "value": "pending"
                                                }
                                          ],
                                          "defaultValue": "signed"
                                    },
                                    {
                                          "id": "consent_date",
                                          "label": "Fecha de Firma",
                                          "type": "date",
                                          "defaultValue": "2026-10-22"
                                    }
                              ]
                        }
                  ]
            },
            {
                  "id": "stage_exam",
                  "stepNumber": 2,
                  "title": "Examen Físico Funcional",
                  "description": "Palpación, Oxford, Laycock PERFECT y Prolapso",
                  "sections": [
                        {
                              "id": "sec_abdomino_pelvic",
                              "title": "Evaluación Abdominopélvica & Sinergia Diafragmática",
                              "icon": "fa-child-reaching",
                              "columns": 3,
                              "fields": [
                                    {
                                          "id": "diastasis_cm",
                                          "label": "Diástasis Supraumbilical (cm)",
                                          "type": "number",
                                          "step": "0.1",
                                          "defaultValue": 2.5
                                    },
                                    {
                                          "id": "valsalva_response",
                                          "label": "Respuesta al Esfuerzo / Tos",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "Incompetente (abombamiento y escape)",
                                                      "value": "incompetent"
                                                },
                                                {
                                                      "label": "Competente (pre-contracción refleja / The Knack)",
                                                      "value": "competent"
                                                },
                                                {
                                                      "label": "Inversión de comando motor",
                                                      "value": "inverted"
                                                }
                                          ],
                                          "defaultValue": "incompetent"
                                    },
                                    {
                                          "id": "diaphragm_tone",
                                          "label": "Tono Diafragmático",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "Hipertonía / Bloqueo inspiratorio",
                                                      "value": "hypertonic"
                                                },
                                                {
                                                      "label": "Eutónico / Excursión libre",
                                                      "value": "normal"
                                                }
                                          ],
                                          "defaultValue": "hypertonic"
                                    }
                              ]
                        },
                        {
                              "id": "sec_perfect_scheme",
                              "title": "Palpación Intracavitaria: Esquema PERFECT (Laycock)",
                              "icon": "fa-hand-holding-medical",
                              "type": "score_card",
                              "scoreId": "perfect_power",
                              "scoreName": "Fuerza Oxford Basal",
                              "maxScore": 5,
                              "columns": 4,
                              "fields": [
                                    {
                                          "id": "perfect_p",
                                          "label": "P - Power (Escala Oxford 0-5)",
                                          "type": "number",
                                          "min": 0,
                                          "max": 5,
                                          "defaultValue": 2
                                    },
                                    {
                                          "id": "perfect_e",
                                          "label": "E - Endurance (Resistencia seg)",
                                          "type": "number",
                                          "min": 0,
                                          "max": 10,
                                          "defaultValue": 4
                                    },
                                    {
                                          "id": "perfect_r",
                                          "label": "R - Repetitions (Repeticiones)",
                                          "type": "number",
                                          "min": 0,
                                          "max": 10,
                                          "defaultValue": 3
                                    },
                                    {
                                          "id": "perfect_f",
                                          "label": "F - Fast (Contracciones rápidas)",
                                          "type": "number",
                                          "min": 0,
                                          "max": 10,
                                          "defaultValue": 4
                                    }
                              ]
                        },
                        {
                              "id": "sec_popq",
                              "title": "Estadificación de Prolapso (POP-Q Simplificado)",
                              "icon": "fa-layer-group",
                              "columns": 3,
                              "fields": [
                                    {
                                          "id": "popq_anterior",
                                          "label": "Pared Anterior (Cistocele)",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "Estadio 0 (Sin descenso)",
                                                      "value": "0"
                                                },
                                                {
                                                      "label": "Estadio I (>1 cm sobre himen)",
                                                      "value": "I"
                                                },
                                                {
                                                      "label": "Estadio II (a nivel del himen ±1cm)",
                                                      "value": "II"
                                                },
                                                {
                                                      "label": "Estadio III (exteriorizado >1cm)",
                                                      "value": "III"
                                                }
                                          ],
                                          "defaultValue": "I"
                                    },
                                    {
                                          "id": "popq_apical",
                                          "label": "Compartimento Apical (Útero/Cúpula)",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "Estadio 0 (Normal)",
                                                      "value": "0"
                                                },
                                                {
                                                      "label": "Estadio I",
                                                      "value": "I"
                                                },
                                                {
                                                      "label": "Estadio II",
                                                      "value": "II"
                                                }
                                          ],
                                          "defaultValue": "0"
                                    },
                                    {
                                          "id": "popq_posterior",
                                          "label": "Pared Posterior (Rectocele)",
                                          "type": "select",
                                          "options": [
                                                {
                                                      "label": "Estadio 0 (Normal)",
                                                      "value": "0"
                                                },
                                                {
                                                      "label": "Estadio I (Descenso leve rectovaginal)",
                                                      "value": "I"
                                                },
                                                {
                                                      "label": "Estadio II",
                                                      "value": "II"
                                                }
                                          ],
                                          "defaultValue": "I"
                                    }
                              ]
                        }
                  ]
            },
            {
                  "id": "stage_treatment",
                  "stepNumber": 3,
                  "title": "Plan de Tratamiento",
                  "description": "Prescripciones estandarizadas y protocolos a medida",
                  "sections": [
                        {
                              "id": "sec_modalities",
                              "title": "Modalidades Clínicas & Constructor Ad-Hoc",
                              "icon": "fa-wand-magic-sparkles",
                              "type": "treatment_builder",
                              "standardOptions": [
                                    {
                                          "id": "kegel",
                                          "name": "Cinesiterapia (Ejercicios de Kegel)",
                                          "params": "5s contracción / 10s descanso / 3 series día",
                                          "checked": true
                                    },
                                    {
                                          "id": "electro",
                                          "name": "Electroestimulación Uroginecológica",
                                          "params": "35 Hz / 250 µs / Sonda Vaginal / 20 min",
                                          "checked": true
                                    },
                                    {
                                          "id": "biofeedback",
                                          "name": "Biofeedback EMG de piso pélvico",
                                          "params": "Objetivo reposo ≤2µV / Pico ≥18µV",
                                          "checked": true
                                    },
                                    {
                                          "id": "home_cones",
                                          "name": "Conos vaginales domiciliarios",
                                          "params": "Cono #2 (35g) 10 min en bipedestación activa",
                                          "checked": false
                                    }
                              ],
                              "customTreatmentsDefault": [
                                    {
                                          "title": "Tecarterapia / Radiofrecuencia Intracavitaria (448 kHz)",
                                          "category": "Diatermia profunda",
                                          "zone": "Cicatriz episiotomía y ligamento sacroespinoso",
                                          "dose": "Capacitivo 40% (10m) + Resistivo 30% (8m) - 1 sesión/sem"
                                    }
                              ]
                        }
                  ]
            },
            {
                  "id": "stage_evolution",
                  "stepNumber": 4,
                  "title": "Evolución & Métricas",
                  "description": "Nota SOAP y analítica comparativa visual",
                  "sections": [
                        {
                              "id": "sec_soap",
                              "title": "Evolución Clínica (Estándar SOAP)",
                              "icon": "fa-clipboard-check",
                              "columns": 2,
                              "fields": [
                                    {
                                          "id": "soap_s",
                                          "label": "S - Subjetivo (Sensaciones y reporte semanal)",
                                          "type": "textarea",
                                          "defaultValue": "Solo 1 escape leve al estornudar fuerte en la semana. Sin pesadez."
                                    },
                                    {
                                          "id": "soap_o",
                                          "label": "O - Objetivo (Reevaluación PERFECT & EMG)",
                                          "type": "textarea",
                                          "defaultValue": "Oxford sube a Grado 3 (contracción moderada con elevación). Sostiene 7 segundos."
                                    },
                                    {
                                          "id": "soap_a",
                                          "label": "A - Análisis / Apreciación Diagnóstica",
                                          "type": "textarea",
                                          "defaultValue": "Evolución favorable. Reducción del 65% en severidad de IUE. Cicatriz perineal indolora."
                                    },
                                    {
                                          "id": "soap_p",
                                          "label": "P - Plan / Progresión de Cargas",
                                          "type": "textarea",
                                          "defaultValue": "Progresar contracciones en bipedestación activa. Añadir cono vaginal #3 (50g)."
                                    }
                              ]
                        },
                        {
                              "id": "sec_charts",
                              "title": "Gráficos Biomecánicos & Curvas de Recuperación",
                              "icon": "fa-chart-pie",
                              "type": "charts_dashboard",
                              "charts": [
                                    {
                                          "id": "radar_perfect",
                                          "type": "radar",
                                          "title": "Radar Biomecánico PERFECT (Basal vs Actual)"
                                    },
                                    {
                                          "id": "line_iciq",
                                          "type": "line",
                                          "title": "Curva de Descenso ICIQ-UI SF (0 a 21)"
                                    }
                              ]
                        }
                  ]
            }
      ],
      "code": "PELVI_EVAL"
}
    };
  }

}
