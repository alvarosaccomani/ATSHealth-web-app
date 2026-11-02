import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BiologicalSex, PatientStickyBarComponent } from '../patient-sticky-bar/patient-sticky-bar.component';
import { StageBarComponent } from '../stage-bar/stage-bar.component';
import { Stage1AnamnesisComponent } from '../stages/stage-1-anamnesis/stage-1-anamnesis.component';
import { Stage2PhysicalExamComponent } from '../stages/stage-2-physical-exam/stage-2-physical-exam.component';
import { Stage3TreatmentPlanComponent } from '../stages/stage-3-treatment-plan/stage-3-treatment-plan.component';
import { Stage4EvolutionComponent } from '../stages/stage-4-evolution/stage-4-evolution.component';
import { PatientsService } from '@services/patients.service';
import { CompanyContextService } from '@services/company-context.service';
import { ToastService } from '@services/toast.service';

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
  private readonly toast = inject(ToastService);

  readonly activeStage = signal<number>(1);
  readonly activeSex = signal<BiologicalSex>('femenino');
  readonly isLoading = signal<boolean>(false);

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
        // Si entra sin pat_uuid pero ya había un paciente seleccionado, mantenerlo
        const current = this.patientsService.activePatient();
        if (current) {
          const bioSex = (current.pat_biologicalsex?.toLowerCase() as BiologicalSex) || 'femenino';
          this.activeSex.set(bioSex);
        } else {
          // Si no hay paciente seleccionado ni en la URL, volver al listado
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
          // Validar aislamiento multi-tenant: que pertenezca a la clínica activa si ya hay una
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
}
