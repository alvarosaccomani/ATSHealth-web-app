import { Component, input, output, signal, computed, effect } from '@angular/core';
import { BiologicalSex } from '../../patient-sticky-bar/patient-sticky-bar.component';
import { ConsentModalComponent } from '@components/consent-modal/consent-modal.component';

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

export type PerinealTraumaType =
  | 'episiotomia'
  | 'desgarro_1'
  | 'desgarro_2'
  | 'oasir'
  | 'integro'
  | 'no_aplica';

export interface ObstetricHistoryState {
  gestas: number;
  partos: number;
  cesareas: number;
  abortos: number;
  pesoFetalMax: number | null;
  traumaPerineal: PerinealTraumaType;
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

  // Antecedentes Gineco-Obstétricos Reactivos
  readonly gestas = signal<number>(2);
  readonly partos = signal<number>(1);
  readonly cesareas = signal<number>(0);
  readonly abortos = signal<number>(1);
  readonly pesoFetalMax = signal<number | null>(3750);
  readonly traumaPerineal = signal<PerinealTraumaType>('episiotomia');

  // Reglas Clínicas Reactivas (Computeds)
  readonly isFemale = computed(() => this.sex() === 'femenino');

  // Si gestas == 0 o no es mujer, no pueden existir datos de partos/cesáreas/abortos ni peso fetal
  readonly canHavePregnancyData = computed(() => this.isFemale() && this.gestas() > 0);

  // El trauma perineal solo aplica si hubo al menos un parto vaginal
  readonly canHavePerinealTrauma = computed(() => this.canHavePregnancyData() && this.partos() > 0);

  constructor() {
    // Si el sexo cambia a masculino, se sanitizan los campos obstétricos
    effect(() => {
      if (!this.isFemale()) {
        this.gestas.set(0);
        this.partos.set(0);
        this.cesareas.set(0);
        this.abortos.set(0);
        this.pesoFetalMax.set(null);
        this.traumaPerineal.set('no_aplica');
      }
    });
  }

  setGestas(val: number | string): void {
    const cleanVal = Math.max(0, Number(val) || 0);
    this.gestas.set(cleanVal);
    if (cleanVal === 0) {
      this.partos.set(0);
      this.cesareas.set(0);
      this.abortos.set(0);
      this.pesoFetalMax.set(null);
      this.traumaPerineal.set('no_aplica');
    }
  }

  setPartos(val: number | string): void {
    const cleanVal = Math.max(0, Number(val) || 0);
    this.partos.set(cleanVal);
    if (cleanVal === 0) {
      this.traumaPerineal.set('no_aplica');
    } else if (this.traumaPerineal() === 'no_aplica') {
      this.traumaPerineal.set('integro');
    }
  }

  setCesareas(val: number | string): void {
    this.cesareas.set(Math.max(0, Number(val) || 0));
  }

  setAbortos(val: number | string): void {
    this.abortos.set(Math.max(0, Number(val) || 0));
  }

  setPesoFetalMax(val: number | string | null): void {
    if (val === '' || val === null || val === undefined) {
      this.pesoFetalMax.set(null);
    } else {
      const num = Number(val);
      this.pesoFetalMax.set(!isNaN(num) ? num : null);
    }
  }

  setTraumaPerineal(val: PerinealTraumaType): void {
    this.traumaPerineal.set(val);
  }

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

  getData(): Record<string, any> {
    return {
      consentStatus: this.consentStatus(),
      obstetricPhase: this.obstetricPhase(),
      obstetricHistory: this.isFemale()
        ? {
            gestas: this.gestas(),
            partos: this.canHavePregnancyData() ? this.partos() : 0,
            cesareas: this.canHavePregnancyData() ? this.cesareas() : 0,
            abortos: this.canHavePregnancyData() ? this.abortos() : 0,
            pesoFetalMax: this.canHavePregnancyData() ? this.pesoFetalMax() : null,
            traumaPerineal: this.canHavePerinealTrauma() ? this.traumaPerineal() : 'no_aplica',
          }
        : null,
      iciq: {
        freq: this.iciqFreq(),
        vol: this.iciqVol(),
        impact: this.iciqImpact(),
        score: this.iciqScore(),
        severity: this.iciqSeverity().label,
      },
      bristol: {
        selectedType: this.selectedBristol(),
      },
      diary: {
        entries: this.diaryRows(),
        totals: this.diaryTotals(),
      },
    };
  }

  hydrateData(data: Record<string, any>): void {
    if (!data) return;
    if (data['consentStatus']) this.consentStatus.set(data['consentStatus']);
    if (data['obstetricPhase']) this.obstetricPhase.set(data['obstetricPhase']);
    if (data['obstetricHistory']) {
      const obs = data['obstetricHistory'];
      if (typeof obs.gestas === 'number') this.gestas.set(obs.gestas);
      if (typeof obs.partos === 'number') this.partos.set(obs.partos);
      if (typeof obs.cesareas === 'number') this.cesareas.set(obs.cesareas);
      if (typeof obs.abortos === 'number') this.abortos.set(obs.abortos);
      if (obs.pesoFetalMax !== undefined) this.pesoFetalMax.set(obs.pesoFetalMax);
      if (obs.traumaPerineal) this.traumaPerineal.set(obs.traumaPerineal);
    }
    if (data['iciq']) {
      if (typeof data['iciq'].freq === 'number') this.iciqFreq.set(data['iciq'].freq);
      if (typeof data['iciq'].vol === 'number') this.iciqVol.set(data['iciq'].vol);
      if (typeof data['iciq'].impact === 'number') this.iciqImpact.set(data['iciq'].impact);
    }
    if (data['bristol'] && typeof data['bristol'].selectedType === 'number') {
      this.selectedBristol.set(data['bristol'].selectedType);
    }
    if (data['diary'] && Array.isArray(data['diary'].entries)) {
      this.diaryRows.set(data['diary'].entries);
    }
  }
}
