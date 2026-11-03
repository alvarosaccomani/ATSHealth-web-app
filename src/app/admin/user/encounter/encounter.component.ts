import { Component, OnInit, effect, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BiologicalSex, PatientStickyBarComponent } from '../patient-sticky-bar/patient-sticky-bar.component';
import { StageBarComponent } from '../stage-bar/stage-bar.component';
import { Stage1AnamnesisComponent } from '../stages/stage-1-anamnesis/stage-1-anamnesis.component';
import { Stage2PhysicalExamComponent } from '../stages/stage-2-physical-exam/stage-2-physical-exam.component';
import { Stage3TreatmentPlanComponent } from '../stages/stage-3-treatment-plan/stage-3-treatment-plan.component';
import { Stage4EvolutionComponent } from '../stages/stage-4-evolution/stage-4-evolution.component';
import { PatientsService } from '@services/patients.service';
import { CompanyContextService } from '@services/company-context.service';
import { AuthService } from '@services/auth.service';
import { EncountersService } from '@services/encounters.service';
import { ToastService } from '@services/toast.service';
import { CreateEncounterPayload } from '@interfaces/encounter';

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
  private readonly encountersService = inject(EncountersService);
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

  constructor() {
    // Sincroniza el sexo biológico con el paciente activo en todo momento
    effect(() => {
      const patient = this.patientsService.activePatient();
      if (patient) {
        const bioSex = (patient.pat_biologicalsex?.toLowerCase() as BiologicalSex) || 'femenino';
        this.activeSex.set(bioSex);
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

    const sticky = this.stickyBar()?.getData();
    const s1 = this.stage1()?.getData();
    const s2 = this.stage2()?.getData();
    const s3 = this.stage3()?.getData();
    const s4 = this.stage4()?.getData();
    const treatments = this.stage3()?.getTreatmentsPayload() || [];

    const payload: CreateEncounterPayload = {
      cmp_uuid: activeCmp.cmp_uuid,
      pat_uuid: activePat.pat_uuid,
      usr_uuid_practitioner: currentUser?.usr_uuid,
      enc_type: 'CONSULTATION',
      enc_status: isCompleted ? 'SIGNED_LOCKED' : 'IN_PROGRESS',
      enc_date: sticky?.['consultDate'] || new Date().toISOString(),
      enc_reason: sticky?.['consultReason'] || null,
      form_data: {
        anamnesis: s1,
        physical_exam: s2,
        treatment_plan: s3,
        evolution: s4,
        consultJob: sticky?.['consultJob'],
        consultGoal: sticky?.['consultGoal'],
      },
      calculated_scores: {
        iciq_score: s1?.['iciq']?.score ?? null,
        iciq_severity: s1?.['iciq']?.severity ?? null,
        oxford_grade: s2?.['oxfordGrade'] ?? null,
        perfect_power: s2?.['perfect']?.power ?? null,
        bristol_type: s1?.['bristol']?.selectedType ?? null,
      },
      treatments,
    };

    this.encountersService.saveEncounter(payload).subscribe({
      next: () => {
        this.stickyBar()?.setSavedStatus('Guardado recién');
        this.toast.success(
          isCompleted
            ? '¡Consulta médica finalizada y firmada con éxito!'
            : 'Consulta médica guardada correctamente.'
        );
      },
      error: (err) => {
        this.stickyBar()?.setSavedStatus('Error al guardar');
        const msg = err?.error?.message || err?.message || 'Error al guardar la consulta.';
        this.toast.error(msg);
      },
    });
  }
}
