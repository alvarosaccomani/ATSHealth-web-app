import { Component, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BiologicalSex, PatientStickyBarComponent } from '../patient-sticky-bar/patient-sticky-bar.component';
import { StageBarComponent, StageItem } from '../stage-bar/stage-bar.component';
import { Stage1AnamnesisComponent } from '../stages/stage-1-anamnesis/stage-1-anamnesis.component';
import { Stage2PhysicalExamComponent } from '../stages/stage-2-physical-exam/stage-2-physical-exam.component';
import { Stage3TreatmentPlanComponent } from '../stages/stage-3-treatment-plan/stage-3-treatment-plan.component';
import { Stage4EvolutionComponent } from '../stages/stage-4-evolution/stage-4-evolution.component';
import { PatientsService } from '@services/patients.service';
import { CompanyContextService } from '@services/company-context.service';
import { AuthService } from '@services/auth.service';
import { EncountersService } from '@services/encounters.service';
import { TemplatesService } from '@services/templates.service';
import { ToastService } from '@services/toast.service';
import {
  CreateEncounterPayload,
  EncounterInterface,
  EncounterTemplateMeta,
  UpdateEncounterPayload,
} from '@interfaces/encounter';
import { DynamicStageSchema, DynamicTemplateSchema } from '@interfaces/dynamic-form';
import { DynamicFormComponent } from '@components/dynamic-form';

@Component({
  selector: 'app-encounter',
  standalone: true,
  imports: [
    PatientStickyBarComponent,
    StageBarComponent,
    Stage1AnamnesisComponent,
    Stage2PhysicalExamComponent,
    Stage3TreatmentPlanComponent,
    Stage4EvolutionComponent,
    DynamicFormComponent,
  ],
  templateUrl: './encounter.component.html',
  styleUrl: './encounter.component.scss',
})
export class EncounterComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly patientsService = inject(PatientsService);
  readonly companyContext = inject(CompanyContextService);
  private readonly authService = inject(AuthService);
  readonly encountersService = inject(EncountersService);
  readonly templatesService = inject(TemplatesService);
  private readonly toast = inject(ToastService);

  readonly stickyBar = viewChild<PatientStickyBarComponent>('stickyBar');
  readonly stage1 = viewChild<Stage1AnamnesisComponent>('stage1');
  readonly stage2 = viewChild<Stage2PhysicalExamComponent>('stage2');
  readonly stage3 = viewChild<Stage3TreatmentPlanComponent>('stage3');
  readonly stage4 = viewChild<Stage4EvolutionComponent>('stage4');

  readonly activeStage = signal<number>(1);
  readonly activeSex = signal<BiologicalSex>('femenino');
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = this.encountersService.isSaving;

  // Estado del Motor Dinámico
  readonly dynamicData = signal<Record<string, any>>({});
  readonly isLocked = computed(() => this.encountersService.activeEncounter()?.enc_status === 'SIGNED_LOCKED');

  readonly isPelviEval = computed(() => {
    const code = this.templatesService.activeTemplate()?.tpl_code;
    return !code || code === 'PELVI_EVAL';
  });

  readonly templateStages = computed<DynamicStageSchema[]>(() => {
    const schema = this.templatesService.activeTemplate()?.tpl_schema as DynamicTemplateSchema | undefined;
    return schema?.stages && Array.isArray(schema.stages) ? schema.stages : [];
  });

  readonly totalDynamicStages = computed(() => this.templateStages().length);

  readonly currentDynamicStage = computed<DynamicStageSchema | null>(() => {
    const stages = this.templateStages();
    const index = this.activeStage() - 1;
    return stages[index] || null;
  });

  readonly stageBarItems = computed<StageItem[]>(() => {
    if (this.isPelviEval()) {
      return [];
    }
    return this.templateStages().map((st: DynamicStageSchema, i: number) => ({
      id: i + 1,
      tag: `Etapa ${i + 1}`,
      label: st.title,
    }));
  });

  constructor() {
    // Sincroniza el sexo biológico con el paciente activo en todo momento
    effect(() => {
      const patient = this.patientsService.activePatient();
      if (patient) {
        const bioSex = (patient.pat_biologicalsex?.toLowerCase() as BiologicalSex) || 'femenino';
        this.activeSex.set(bioSex);
      }
    });

    // Carga las plantillas clínicas operativas de la compañía seleccionada
    effect(() => {
      const activeCmp = this.companyContext.activeCompany();
      if (activeCmp?.cmp_uuid) {
        this.templatesService.getTemplates(activeCmp.cmp_uuid).subscribe({
          error: () => {},
        });
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const pat_uuid = params.get('pat_uuid');
      if (pat_uuid) {
        this.loadPatient(pat_uuid);
      } else {
        const current = this.patientsService.activePatient();
        if (current) {
          const bioSex = (current.pat_biologicalsex?.toLowerCase() as BiologicalSex) || 'femenino';
          this.activeSex.set(bioSex);
          this.loadPatientHistory(current.pat_uuid);
        } else {
          this.toast.info('Seleccioná un paciente para iniciar la consulta clínica.');
          this.router.navigate(['/admin/user/patients']);
        }
      }
    });
  }

  private loadPatient(pat_uuid: string): void {
    const current = this.patientsService.activePatient();
    if (current && current.pat_uuid === pat_uuid) {
      this.loadPatientHistory(pat_uuid);
      return;
    }

    this.isLoading.set(true);
    this.patientsService.getPatientById(pat_uuid).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const patient = res?.data;
        if (patient) {
          const activeCmp = this.companyContext.activeCompany();
          if (activeCmp && patient.cmp_uuid && patient.cmp_uuid !== activeCmp.cmp_uuid) {
            this.toast.warning('El paciente solicitado pertenece a otra sede o clínica.');
            this.router.navigate(['/admin/user/patients']);
            return;
          }

          this.patientsService.selectPatient(patient);
          this.loadPatientHistory(patient.pat_uuid);
        } else {
          this.toast.error('No se encontró el paciente solicitado.');
          this.router.navigate(['/admin/user/patients']);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Error al recuperar los datos del paciente.');
        this.router.navigate(['/admin/user/patients']);
      },
    });
  }

  loadPatientHistory(pat_uuid: string): void {
    const activeCmp = this.companyContext.activeCompany();
    if (!activeCmp?.cmp_uuid || !pat_uuid) return;

    this.encountersService.getEncountersByPatient(pat_uuid, activeCmp.cmp_uuid).subscribe({
      next: (res) => {
        const history = res?.data || [];
        const active = this.encountersService.activeEncounter();
        if (active) {
          this.loadEncounter(active);
        } else if (history.length > 0) {
          // Hidratar con la última consulta registrada
          this.loadEncounter(history[0]);
        }
      },
      error: () => {
        // No bloquear si el paciente aún no tiene historial
      },
    });
  }

  loadEncounter(encounter: EncounterInterface | null): void {
    if (!encounter) {
      this.encountersService.clearActiveEncounter();
      this.stickyBar()?.hydrateEncounter(null);
      this.toast.info('Nueva sesión clínica iniciada en blanco.');
      return;
    }

    this.encountersService.selectEncounter(encounter);
    this.stickyBar()?.hydrateEncounter(encounter);

    const formData = encounter.encounter_data?.encd_formdata;
    if (formData) {
      if (formData['anamnesis']) {
        this.stage1()?.hydrateData(formData['anamnesis']);
      }
      if (formData['physical_exam']) {
        this.stage2()?.hydrateData(formData['physical_exam']);
      }
      if (formData['treatment_plan']) {
        this.stage3()?.hydrateData(formData['treatment_plan'], encounter.treatments);
      }
      if (formData['evolution']) {
        this.stage4()?.hydrateData(formData['evolution']);
      }
      if (formData['dynamic_fields']) {
        this.dynamicData.set(formData['dynamic_fields']);
      }
    } else if (encounter.treatments) {
      this.stage3()?.hydrateData({}, encounter.treatments);
    }

    const tplUuid = encounter.tpl_uuid || encounter.encounter_data?.encd_formdata?.['_meta']?.tpl_uuid;
    if (tplUuid) {
      const match = this.templatesService.templates().find((t) => t.tpl_uuid === tplUuid);
      if (match) {
        this.templatesService.selectTemplate(match);
      }
    }

    this.toast.info(`Cargada Sesión #${encounter.enc_number || 1}`);
  }

  saveConsultation(isCompleted: boolean = false): void {
    const activeCmp = this.companyContext.activeCompany();
    const activePat = this.patientsService.activePatient();
    const currentUser = this.authService.currentUser();

    if (!activeCmp?.cmp_uuid) {
      this.toast.error('No hay una clínica seleccionada.');
      return;
    }
    if (!activePat?.pat_uuid) {
      this.toast.error('No hay un paciente activo seleccionado.');
      return;
    }

    const activeEnc = this.encountersService.activeEncounter();

    // Regla de inmutabilidad: no permitir editar consultas firmadas
    if (activeEnc?.enc_status === 'SIGNED_LOCKED') {
      this.toast.warning('Esta consulta ya fue firmada y bloqueada; no admite modificaciones posteriores.');
      return;
    }

    const sticky = this.stickyBar()?.getData();
    const s1 = this.stage1()?.getData();
    const s2 = this.stage2()?.getData();
    const s3 = this.stage3()?.getData();
    const s4 = this.stage4()?.getData();
    const treatments = this.stage3()?.getTreatmentsPayload() || [];

    const formData = {
      anamnesis: s1,
      physical_exam: s2,
      treatment_plan: s3,
      evolution: s4,
      dynamic_fields: this.dynamicData(),
      consultJob: sticky?.['consultJob'],
      consultGoal: sticky?.['consultGoal'],
    };

    const calculatedScores = {
      iciq_score: s1?.['iciq']?.score ?? null,
      iciq_severity: s1?.['iciq']?.severity ?? null,
      oxford_grade: s2?.['oxfordGrade'] ?? null,
      perfect_power: s2?.['perfect']?.power ?? null,
      bristol_type: s1?.['bristol']?.selectedType ?? null,
    };

    const activeTpl = this.templatesService.activeTemplate();
    const templateMeta: EncounterTemplateMeta = {
      tpl_uuid: activeTpl?.tpl_uuid || '',
      tpl_code: activeTpl?.tpl_code || 'PELVI_EVAL',
      tpl_name: activeTpl?.tpl_name || 'Evaluación de Piso Pélvico',
      tpl_version: activeTpl?.tpl_version || '1.0.0',
      captured_at: new Date().toISOString(),
    };

    // BIFURCACIÓN: Actualización si ya existe la sesión y está IN_PROGRESS
    if (activeEnc?.enc_uuid && activeEnc.enc_status === 'IN_PROGRESS') {
      const existingFormData = activeEnc.encounter_data?.encd_formdata || {};
      const mergedFormData = {
        ...existingFormData,
        ...formData,
        _meta: existingFormData['_meta'] || templateMeta,
      };

      const updatePayload: UpdateEncounterPayload = {
        enc_status: isCompleted ? 'SIGNED_LOCKED' : 'IN_PROGRESS',
        enc_reason: sticky?.['consultReason'] || null,
        enc_signedat: isCompleted ? new Date().toISOString() : undefined,
        enc_signedby: isCompleted ? currentUser?.usr_uuid : undefined,
        form_data: mergedFormData,
        calculated_scores: calculatedScores,
        treatments,
      };

      this.encountersService.updateEncounter(activeEnc.enc_uuid, activeCmp.cmp_uuid, updatePayload).subscribe({
        next: (res) => {
          const enc = res?.data || this.encountersService.activeEncounter();
          const sessionLabel = enc?.enc_number ? `Sesión #${enc.enc_number}` : 'Consulta';
          this.stickyBar()?.setSavedStatus(isCompleted ? 'Consulta firmada' : `${sessionLabel} actualizada`);
          this.toast.success(
            isCompleted
              ? `¡${sessionLabel} firmada y bloqueada con éxito!`
              : `¡${sessionLabel} actualizada correctamente!`
          );

          if (activePat.pat_uuid) {
            this.loadPatientHistory(activePat.pat_uuid);
          }
        },
        error: (err) => {
          this.stickyBar()?.setSavedStatus('Error al actualizar');
          const msg = err?.error?.message || err?.message || 'Error al actualizar la consulta.';
          this.toast.error(msg);
        },
      });
      return;
    }

    // CREACIÓN de nueva sesión en blanco
    const existingOpenSession = this.encountersService.openSession();
    if (existingOpenSession && existingOpenSession.enc_uuid !== activeEnc?.enc_uuid) {
      this.toast.warning(
        `El paciente ya tiene la Sesión #${existingOpenSession.enc_number} en curso. No se pueden abrir múltiples sesiones simultáneas; se cargó la sesión abierta.`
      );
      this.loadEncounter(existingOpenSession);
      return;
    }

    const initialFormData = {
      ...formData,
      _meta: templateMeta,
    };

    const payload: CreateEncounterPayload = {
      cmp_uuid: activeCmp.cmp_uuid,
      pat_uuid: activePat.pat_uuid,
      usr_uuid_practitioner: currentUser?.usr_uuid,
      tpl_uuid: activeTpl?.tpl_uuid || null,
      enc_type: 'CONSULTATION',
      enc_status: isCompleted ? 'SIGNED_LOCKED' : 'IN_PROGRESS',
      enc_date: sticky?.['consultDate'] || new Date().toISOString(),
      enc_reason: sticky?.['consultReason'] || null,
      form_data: initialFormData,
      calculated_scores: calculatedScores,
      treatments,
    };

    this.encountersService.saveEncounter(payload).subscribe({
      next: () => {
        const enc = this.encountersService.activeEncounter();
        const sessionLabel = enc?.enc_number ? `Sesión #${enc.enc_number}` : 'Consulta';
        this.stickyBar()?.setSavedStatus(isCompleted ? 'Consulta firmada' : `${sessionLabel} guardada`);
        this.toast.success(
          isCompleted
            ? `¡${sessionLabel} finalizada y firmada con éxito!`
            : `¡${sessionLabel} guardada correctamente!`
        );

        if (activePat.pat_uuid) {
          this.loadPatientHistory(activePat.pat_uuid);
        }
      },
      error: (err) => {
        this.stickyBar()?.setSavedStatus('Error al guardar');
        const msg = err?.error?.message || err?.message || 'Error al guardar la consulta.';
        this.toast.error(msg);
      },
    });
  }

  signConsultation(): void {
    const activeEnc = this.encountersService.activeEncounter();
    if (!activeEnc?.enc_uuid) {
      this.toast.warning('Primero debés guardar la consulta antes de poder firmarla.');
      return;
    }
    if (activeEnc.enc_status === 'SIGNED_LOCKED') {
      this.toast.info('La consulta ya se encuentra firmada.');
      return;
    }

    const confirmed = window.confirm(
      '¿Confirmás la firma y cierre definitivo de esta consulta médica? Una vez firmada, no se podrán realizar más modificaciones.'
    );
    if (!confirmed) return;

    this.saveConsultation(true);
  }
}
