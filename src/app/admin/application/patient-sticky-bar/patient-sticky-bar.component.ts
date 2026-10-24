import { Component, HostListener, signal, output } from '@angular/core';

export type BiologicalSex = 'femenino' | 'masculino';

@Component({
  selector: 'app-patient-sticky-bar',
  imports: [],
  templateUrl: './patient-sticky-bar.component.html',
  styleUrl: './patient-sticky-bar.component.scss',
})
export class PatientStickyBarComponent {
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

    this.sexChange.emit(selectedSex);
  }

  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.patientName.set(input.value);
  }
}
