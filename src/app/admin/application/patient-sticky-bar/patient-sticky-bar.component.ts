import { Component, HostListener, effect, inject, output, signal } from '@angular/core';
import { ToastService } from '@services/toast.service';
import { PatientsService } from '@services/patients.service';

export type BiologicalSex = 'femenino' | 'masculino';

@Component({
  selector: 'app-patient-sticky-bar',
  imports: [],
  templateUrl: './patient-sticky-bar.component.html',
  styleUrl: './patient-sticky-bar.component.scss',
})
export class PatientStickyBarComponent {
  private readonly toast = inject(ToastService);
  private readonly patientsService = inject(PatientsService, { optional: true });

  readonly sex = signal<BiologicalSex>('femenino');
  readonly sexChange = output<BiologicalSex>();

  readonly patientName = signal<string>('Mariana González Rivas');
  readonly age = signal<number>(38);
  readonly historyNumber = signal<string>('#PLV-2026-089');
  readonly dni = signal<string>('35.892.110');
  readonly healthInsurance = signal<string>('OSDE 310');
  readonly professional = signal<string>('Lic. Kgo. Especialista');
  readonly consultDate = signal<string>('2026-10-22');

  readonly consultReason = signal<string>(
    'Pérdidas de orina involuntarias al estornudar y toser tras 8 meses postparto vaginal'
  );
  readonly consultJob = signal<string>(
    'Docente de secundaria (bipedestación prolongada > 5 hs/día, esfuerzos vocales)'
  );
  readonly consultGoal = signal<string>(
    'Retomar entrenamiento de running sin uso de compresas ni escapes'
  );

  readonly isCompact = signal<boolean>(false);
  readonly isManuallyExpanded = signal<boolean>(false);

  constructor() {
    effect(() => {
      const patient = this.patientsService?.activePatient();
      if (patient) {
        this.patientName.set(`${patient.pat_firstname} ${patient.pat_lastname}`);
        this.dni.set(patient.pat_documentnumber);
        const bioSex = (patient.pat_biologicalsex as BiologicalSex) || 'femenino';
        this.sex.set(bioSex);
        this.sexChange.emit(bioSex);
        if (patient.pat_birthdate) {
          this.age.set(this.patientsService?.calculateAge(patient.pat_birthdate) ?? 38);
        }
        if (patient.pat_medicalcoverage) {
          this.healthInsurance.set(
            `${patient.pat_medicalcoverage}${patient.pat_affiliatenumber ? ' #' + patient.pat_affiliatenumber : ''}`
          );
        }
        if (patient.pat_occupation) {
          this.consultJob.set(patient.pat_occupation);
        }
      }
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (typeof window === 'undefined') return;
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 70) {
      if (!this.isManuallyExpanded()) {
        this.isCompact.set(true);
      }
    } else {
      this.isManuallyExpanded.set(false);
      this.isCompact.set(false);
    }
  }

  toggleExpansion(): void {
    if (this.isCompact()) {
      this.isManuallyExpanded.set(true);
      this.isCompact.set(false);
    } else {
      this.isManuallyExpanded.set(false);
      this.isCompact.set(true);
    }
  }

  setBiologicalGender(selectedSex: BiologicalSex): void {
    if (this.sex() === selectedSex) return;

    this.sex.set(selectedSex);

    if (selectedSex === 'masculino' && this.patientName() === 'Mariana González Rivas') {
      this.patientName.set('Roberto Carlos Gómez');
    } else if (selectedSex === 'femenino' && this.patientName() === 'Roberto Carlos Gómez') {
      this.patientName.set('Mariana González Rivas');
    }

    this.toast.info(
      selectedSex === 'femenino'
        ? 'Configurado perfil Gineco-Obstétrico'
        : 'Configurado perfil Urológico Masculino'
    );

    this.sexChange.emit(selectedSex);
  }

  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.patientName.set(input.value);
  }
}
