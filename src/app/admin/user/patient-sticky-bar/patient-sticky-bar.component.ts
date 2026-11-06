import { Component, HostListener, computed, effect, inject, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastService } from '@services/toast.service';
import { PatientsService } from '@services/patients.service';
import { AuthService } from '@services/auth.service';
import { EncountersService } from '@services/encounters.service';
import { TemplatesService } from '@services/templates.service';
import { EncounterInterface } from '@interfaces/encounter';

export type BiologicalSex = 'femenino' | 'masculino';

@Component({
  selector: 'app-patient-sticky-bar',
  imports: [DatePipe],
  templateUrl: './patient-sticky-bar.component.html',
  styleUrl: './patient-sticky-bar.component.scss',
})
export class PatientStickyBarComponent {
  private readonly toast = inject(ToastService);
  private readonly patientsService = inject(PatientsService, { optional: true });
  private readonly authService = inject(AuthService, { optional: true });
  readonly encountersService = inject(EncountersService);
  readonly templatesService = inject(TemplatesService);

  readonly sex = signal<BiologicalSex>('femenino');
  readonly sexChange = output<BiologicalSex>();
  readonly sessionSelect = output<EncounterInterface | null>();
  readonly onSave = output<void>();
  readonly onSign = output<void>();
  readonly onPrint = output<void>();

  readonly isSessionDropdownOpen = signal<boolean>(false);
  readonly isLocked = computed(() => this.encountersService.activeEncounter()?.enc_status === 'SIGNED_LOCKED');
  readonly hasActiveSession = computed(() => !!this.encountersService.activeEncounter()?.enc_uuid);
  readonly activeTemplateName = computed(() => this.templatesService.activeTemplate()?.tpl_name || 'Evaluación Piso Pélvico');

  readonly patientName = signal<string>('');
  readonly age = signal<number | null>(null);
  readonly historyNumber = signal<string>('-');
  readonly dni = signal<string>('-');
  readonly healthInsurance = signal<string>('Particular');
  readonly professional = signal<string>('Lic. Profesional');
  readonly consultDate = signal<string>(new Date().toISOString().split('T')[0]);

  readonly consultReason = signal<string>('');
  readonly consultJob = signal<string>('');
  readonly consultGoal = signal<string>('');

  readonly isCompact = signal<boolean>(false);
  readonly isManuallyExpanded = signal<boolean>(false);
  readonly autosaveStatus = signal<string>('Autoguardado activo');

  constructor() {
    effect(() => {
      const user = this.authService?.currentUser();
      if (user) {
        const fullName = `${user.usr_name || ''} ${user.usr_surname || ''}`.trim();
        this.professional.set(fullName ? `Lic. ${fullName}` : 'Lic. Profesional');
      }

      const patient = this.patientsService?.activePatient();
      if (patient) {
        this.patientName.set(`${patient.pat_firstname} ${patient.pat_lastname}`.trim());
        this.dni.set(patient.pat_documentnumber || '-');
        const bioSex = (patient.pat_biologicalsex?.toLowerCase() as BiologicalSex) || 'femenino';
        this.sex.set(bioSex);
        this.sexChange.emit(bioSex);
        if (patient.pat_birthdate) {
          this.age.set(this.patientsService?.calculateAge(patient.pat_birthdate) ?? null);
        } else {
          this.age.set(null);
        }
        const hc = patient.pat_documentnumber
          ? `#HC-${patient.pat_documentnumber}`
          : `#PLV-${patient.pat_uuid.slice(0, 8).toUpperCase()}`;
        this.historyNumber.set(hc);
        if (patient.pat_medicalcoverage) {
          this.healthInsurance.set(
            `${patient.pat_medicalcoverage}${patient.pat_affiliatenumber ? ' #' + patient.pat_affiliatenumber : ''}`
          );
        } else {
          this.healthInsurance.set('Particular');
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

  printRecord(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
    this.onPrint.emit();
  }

  toggleSessionDropdown(event: Event): void {
    event.stopPropagation();
    this.isSessionDropdownOpen.update((v) => !v);
  }

  selectSession(enc: EncounterInterface | null): void {
    this.isSessionDropdownOpen.set(false);
    this.sessionSelect.emit(enc);
  }

  hydrateEncounter(encounter: EncounterInterface | null): void {
    if (!encounter) {
      this.consultDate.set(new Date().toISOString().split('T')[0]);
      this.consultReason.set('');
      this.consultJob.set('');
      this.consultGoal.set('');
      this.autosaveStatus.set('Autoguardado activo');
      return;
    }

    if (encounter.enc_date) {
      const dateStr =
        typeof encounter.enc_date === 'string'
          ? encounter.enc_date.split('T')[0]
          : new Date(encounter.enc_date).toISOString().split('T')[0];
      this.consultDate.set(dateStr);
    }
    if (encounter.enc_reason) {
      this.consultReason.set(encounter.enc_reason);
    }
    const formData = encounter.encounter_data?.encd_formdata;
    if (formData?.['consultJob']) {
      this.consultJob.set(formData['consultJob']);
    }
    if (formData?.['consultGoal']) {
      this.consultGoal.set(formData['consultGoal']);
    }
    if (encounter.practitioner) {
      const name = `${encounter.practitioner.usr_name || ''} ${encounter.practitioner.usr_surname || ''}`.trim();
      if (name) {
        this.professional.set(`Lic. ${name}`);
      }
    }
    this.autosaveStatus.set(
      encounter.enc_status === 'SIGNED_LOCKED' ? 'Consulta firmada' : 'Guardado previo'
    );
  }

  saveRecord(): void {
    this.autosaveStatus.set('Guardando...');
    this.onSave.emit();
  }

  signRecord(): void {
    this.onSign.emit();
  }

  setSavedStatus(status: string): void {
    this.autosaveStatus.set(status);
  }

  getData(): Record<string, any> {
    return {
      consultDate: this.consultDate(),
      consultReason: this.consultReason(),
      consultJob: this.consultJob(),
      consultGoal: this.consultGoal(),
      sex: this.sex(),
    };
  }
}
