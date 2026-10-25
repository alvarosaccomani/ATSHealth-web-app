import { Component, input, output, signal, computed } from '@angular/core';
import { BiologicalSex } from '../../patient-sticky-bar/patient-sticky-bar.component';
import { ConsentModalComponent } from '../../../../shared/components/consent-modal/consent-modal.component';

export interface BristolItem {
  type: number;
  emoji: string;
  title: string;
  desc: string;
  badge: string;
  badgeClass: string;
}

export interface DiaryEntry {
  time: string;
  intakeVol: number;
  intakeType: string;
  voidVol: number;
  urgency: string;
  leak: boolean;
  activity: string;
}

@Component({
  selector: 'app-stage-1-anamnesis',
  imports: [ConsentModalComponent],
  templateUrl: './stage-1-anamnesis.component.html',
  styleUrl: './stage-1-anamnesis.component.scss',
})
export class Stage1AnamnesisComponent {
  readonly sex = input<BiologicalSex>('femenino');
  readonly nextStage = output<number>();

  // Consentimiento
  readonly consentStatus = signal<'signed' | 'digital' | 'pending' | 'revoked'>('signed');
  readonly isConsentModalOpen = signal<boolean>(false);
  readonly consentFileUploaded = signal<boolean>(true);

  // Fase Gineco-Obstétrica
  readonly obstetricPhase = signal<'postparto' | 'preparto' | 'no_aplica'>('postparto');

  // Cuestionario ICIQ-UI SF
  readonly iciqFreq = signal<number>(2);
  readonly iciqVol = signal<number>(2);
  readonly iciqImpact = signal<number>(7);

  readonly iciqScore = computed(() => this.iciqFreq() + this.iciqVol() + this.iciqImpact());

  readonly iciqSeverity = computed(() => {
    const score = this.iciqScore();
    if (score === 0) {
      return {
        label: 'Sin Incontinencia',
        class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      };
    }
    if (score <= 5) {
      return {
        label: 'Impacto Leve',
        class: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
      };
    }
    if (score <= 12) {
      return {
        label: 'Impacto Moderado',
        class: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      };
    }
    if (score <= 18) {
      return {
        label: 'Impacto Severo',
        class: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      };
    }
    return {
      label: 'Impacto Muy Severo',
      class: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    };
  });

  // Escala Bristol
  readonly selectedBristol = signal<number>(2);

  readonly bristolTypes: BristolItem[] = [
    {
      type: 1,
      emoji: '🌰',
      title: 'Tipo 1',
      desc: 'Bolas duras separadas (nuez)',
      badge: 'Estreñimiento Severo',
      badgeClass: 'text-rose-600 dark:text-rose-400',
    },
    {
      type: 2,
      emoji: '🥔',
      title: 'Tipo 2',
      desc: 'Salchicha grumosa apelmazada',
      badge: 'Estreñimiento Leve',
      badgeClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      type: 3,
      emoji: '🥖',
      title: 'Tipo 3',
      desc: 'Salchicha con grietas',
      badge: 'Normal / Aceptable',
      badgeClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      type: 4,
      emoji: '🐍',
      title: 'Tipo 4',
      desc: 'Salchicha suave y lisa',
      badge: 'Ideal / Óptimo',
      badgeClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      type: 5,
      emoji: '🥟',
      title: 'Tipo 5',
      desc: 'Trozos blandos con bordes claros',
      badge: 'Falta de fibra',
      badgeClass: 'text-slate-400 dark:text-slate-500',
    },
    {
      type: 6,
      emoji: '🥣',
      title: 'Tipo 6',
      desc: 'Fragmentos pastosos deshechos',
      badge: 'Diarrea Ligera',
      badgeClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      type: 7,
      emoji: '🌊',
      title: 'Tipo 7',
      desc: 'Totalmente líquida sin sólidos',
      badge: 'Diarrea Severa',
      badgeClass: 'text-rose-600 dark:text-rose-400',
    },
  ];

  // Diario Miccional
  readonly diaryRows = signal<DiaryEntry[]>([
    {
      time: '07:30',
      intakeVol: 300,
      intakeType: 'Café con leche',
      voidVol: 350,
      urgency: '0 (Sin urgencia)',
      leak: false,
      activity: 'No',
    },
    {
      time: '11:15',
      intakeVol: 500,
      intakeType: 'Agua',
      voidVol: 200,
      urgency: '1 (Leve)',
      leak: true,
      activity: 'Sí (Tos al dar clase)',
    },
    {
      time: '15:45',
      intakeVol: 450,
      intakeType: 'Mate',
      voidVol: 250,
      urgency: '2 (Moderada)',
      leak: true,
      activity: 'Sí (Levantar bolsa pesada)',
    },
    {
      time: '19:30',
      intakeVol: 700,
      intakeType: 'Agua',
      voidVol: 300,
      urgency: '1 (Leve)',
      leak: true,
      activity: 'Sí (Risa con amigos)',
    },
    {
      time: '23:00',
      intakeVol: 0,
      intakeType: '',
      voidVol: 500,
      urgency: '0 (Sin urgencia)',
      leak: false,
      activity: 'No',
    },
  ]);

  readonly diaryTotals = computed(() => {
    const rows = this.diaryRows();
    const totalIntake = rows.reduce((acc, r) => acc + (Number(r.intakeVol) || 0), 0);
    const totalVoid = rows.reduce((acc, r) => acc + (Number(r.voidVol) || 0), 0);
    const totalLeaks = rows.filter((r) => r.leak).length;
    return { totalIntake, totalVoid, totalLeaks };
  });

  selectBristol(type: number): void {
    this.selectedBristol.set(type);
  }

  updateIntake(index: number, event: Event): void {
    const val = Number((event.target as HTMLInputElement).value) || 0;
    this.diaryRows.update((rows) => {
      const copy = [...rows];
      copy[index] = { ...copy[index], intakeVol: val };
      return copy;
    });
  }

  updateVoid(index: number, event: Event): void {
    const val = Number((event.target as HTMLInputElement).value) || 0;
    this.diaryRows.update((rows) => {
      const copy = [...rows];
      copy[index] = { ...copy[index], voidVol: val };
      return copy;
    });
  }

  updateLeak(index: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.diaryRows.update((rows) => {
      const copy = [...rows];
      copy[index] = { ...copy[index], leak: checked };
      return copy;
    });
  }

  continueToStage2(): void {
    this.nextStage.emit(2);
  }
}
