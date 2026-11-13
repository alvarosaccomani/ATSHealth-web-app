import { Component, computed, output, signal } from '@angular/core';

export interface CustomTreatment {
  id: string;
  title: string;
  technique: string;
  category: string;
  zone: string;
  parameters: string;
  frequency: string;
  goal: string;
  homeCare: string;
}

@Component({
  selector: 'app-stage-3-treatment-plan',
  imports: [],
  templateUrl: './stage-3-treatment-plan.component.html',
  styleUrl: './stage-3-treatment-plan.component.scss',
})
export class Stage3TreatmentPlanComponent {
  readonly prevStage = output<number>();
  readonly nextStage = output<number>();

  // Selector de vista: 'all' | 'standard' | 'custom'
  readonly treatmentView = signal<'all' | 'standard' | 'custom'>('all');

  // Modalidades estándar
  readonly applyCine = signal<boolean>(true);
  readonly kegelContract = signal<number>(5);
  readonly kegelRest = signal<number>(10);
  readonly kegelSets = signal<number>(3);

  readonly applyElectro = signal<boolean>(true);
  readonly electroHz = signal<number>(35);
  readonly electroUs = signal<number>(250);
  readonly electroMin = signal<number>(20);

  readonly applyBiofeedback = signal<boolean>(true);
  readonly applyHome = signal<boolean>(true);

  // Tratamientos personalizados dinámicos
  readonly customTreatments = signal<CustomTreatment[]>([
    {
      id: 'tx-1',
      title: 'Diatermia profunda / Radiofrecuencia (Tecarterapia pelviana)',
      technique: 'Radiofrecuencia capacitiva y resistiva intracavitaria',
      category: 'Tecnología Electrofísica / Diatermia',
      zone: 'Cicatriz de episiotomía y ligamento sacroespinoso',
      parameters: '448 kHz, Modo Capacitivo 40% (10m) + Resistivo 30% (8m)',
      frequency: '1 sesión/semana x 4 semanas',
      goal: 'Flexibilización de la fibrosis cicatrizal y desensibilización neural',
      homeCare: 'Automasaje perineal suave con aceite de rosa mosqueta 5 min nocturno',
    },
  ]);

  // Resumen reactivo de la prescripción
  readonly prescriptionSummary = computed(() => {
    const parts: string[] = [];

    if (this.applyCine()) {
      parts.push(`Cinesiterapia (Kegel ${this.kegelContract()}s/${this.kegelRest()}s)`);
    }
    if (this.applyElectro()) {
      parts.push(`Electroterapia (${this.electroHz()}Hz / ${this.electroUs()}µs)`);
    }
    if (this.applyBiofeedback()) {
      parts.push('Biofeedback');
    }
    if (this.applyHome()) {
      parts.push('Pautas domiciliarias');
    }

    const customCount = this.customTreatments().length;
    if (customCount > 0) {
      parts.push(`${customCount} Terapia${customCount > 1 ? 's' : ''} Personalizada${customCount > 1 ? 's' : ''}`);
    }

    return parts.length > 0 ? parts.join(' + ') : 'Sin modalidades prescriptas activas';
  });

  setView(view: 'all' | 'standard' | 'custom'): void {
    this.treatmentView.set(view);
  }

  addCustomTreatment(): void {
    const nextNum = this.customTreatments().length + 1;
    const newItem: CustomTreatment = {
      id: `tx-${Date.now()}`,
      title: `Terapia Personalizada #${nextNum}`,
      technique: 'Técnica Manual Miofascial / Neuromodulación',
      category: 'Terapia Manual Específica / Osteopatía',
      zone: 'Suelo pélvico posterior',
      parameters: 'Presión mantenida / Liberación por planos',
      frequency: '2 sesiones/semana',
      goal: 'Normalización del tono miofascial',
      homeCare: 'Pautas de relajación diafragmática',
    };
    this.customTreatments.update((list) => [...list, newItem]);
  }

  duplicateCustomTreatment(id: string): void {
    const target = this.customTreatments().find((t) => t.id === id);
    if (!target) return;
    const clone: CustomTreatment = {
      ...target,
      id: `tx-${Date.now()}`,
      title: `${target.title} (Copia)`,
    };
    this.customTreatments.update((list) => [...list, clone]);
  }

  removeCustomTreatment(id: string): void {
    this.customTreatments.update((list) => list.filter((t) => t.id !== id));
  }

  updateCustomTitle(id: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.customTreatments.update((list) =>
      list.map((t) => (t.id === id ? { ...t, title: val } : t))
    );
  }

  goToPrev(): void {
    this.prevStage.emit(2);
  }

  goToNext(): void {
    this.nextStage.emit(4);
  }

  getData(): Record<string, any> {
    return {
      summary: this.prescriptionSummary(),
      standard: {
        applyCine: this.applyCine(),
        kegelContract: this.kegelContract(),
        kegelRest: this.kegelRest(),
        kegelSets: this.kegelSets(),
        applyElectro: this.applyElectro(),
        electroHz: this.electroHz(),
        electroUs: this.electroUs(),
        electroMin: this.electroMin(),
        applyBiofeedback: this.applyBiofeedback(),
        applyHome: this.applyHome(),
      },
      customTreatments: this.customTreatments(),
    };
  }

  hydrateData(data: Record<string, any>, treatments?: any[]): void {
    if (data?.['standard']) {
      const std = data['standard'];
      if (typeof std.applyCine === 'boolean') this.applyCine.set(std.applyCine);
      if (typeof std.kegelContract === 'number') this.kegelContract.set(std.kegelContract);
      if (typeof std.kegelRest === 'number') this.kegelRest.set(std.kegelRest);
      if (typeof std.kegelSets === 'number') this.kegelSets.set(std.kegelSets);
      if (typeof std.applyElectro === 'boolean') this.applyElectro.set(std.applyElectro);
      if (typeof std.electroHz === 'number') this.electroHz.set(std.electroHz);
      if (typeof std.electroUs === 'number') this.electroUs.set(std.electroUs);
      if (typeof std.electroMin === 'number') this.electroMin.set(std.electroMin);
      if (typeof std.applyBiofeedback === 'boolean') this.applyBiofeedback.set(std.applyBiofeedback);
      if (typeof std.applyHome === 'boolean') this.applyHome.set(std.applyHome);
    }
    if (data?.['customTreatments'] && Array.isArray(data['customTreatments'])) {
      this.customTreatments.set(data['customTreatments']);
    } else if (treatments && Array.isArray(treatments)) {
      const customs = treatments
        .filter((t: any) => t.enctr_kind === 'CUSTOM_ADHOC')
        .map((t: any, idx: number) => ({
          id: t.enctr_uuid || `tx-${idx + 1}`,
          title: t.enctr_name,
          technique: t.enctr_name,
          category: t.enctr_category || 'Terapia personalizada',
          zone: t.enctr_targetzone || 'Pelviana',
          parameters: t.enctr_dosageparameters || '',
          frequency: t.enctr_frequency || 'A demanda',
          goal: '',
          homeCare: t.enctr_homeprescription || '',
        }));
      if (customs.length > 0) {
        this.customTreatments.set(customs);
      }
    }
  }

  getTreatmentsPayload(): Array<{
    enctr_kind: string;
    enctr_code?: string | null;
    enctr_name: string;
    enctr_category?: string | null;
    enctr_targetzone?: string | null;
    enctr_dosageparameters: string;
    enctr_frequency?: string | null;
    enctr_homeprescription?: string | null;
    enctr_isactive: boolean;
  }> {
    const list: Array<any> = [];

    if (this.applyCine()) {
      list.push({
        enctr_kind: 'STANDARD_MODALITY',
        enctr_code: 'kegel',
        enctr_name: 'Cinesiterapia del Suelo Pélvico (Kegel)',
        enctr_category: 'Cinesiterapia',
        enctr_dosageparameters: `Contracción ${this.kegelContract()}s / Reposo ${this.kegelRest()}s / ${this.kegelSets()} series`,
        enctr_frequency: 'Diario',
        enctr_isactive: true,
      });
    }

    if (this.applyElectro()) {
      list.push({
        enctr_kind: 'STANDARD_MODALITY',
        enctr_code: 'electro',
        enctr_name: 'Electroestimulación intracavitaria',
        enctr_category: 'Electroterapia',
        enctr_dosageparameters: `${this.electroHz()}Hz / ${this.electroUs()}µs / ${this.electroMin()} min`,
        enctr_frequency: '2 veces por semana',
        enctr_isactive: true,
      });
    }

    if (this.applyBiofeedback()) {
      list.push({
        enctr_kind: 'STANDARD_MODALITY',
        enctr_code: 'biofeedback',
        enctr_name: 'Biofeedback EMG manométrico',
        enctr_category: 'Reeducación neuromotora',
        enctr_dosageparameters: '15 minutos con pautas de relajación',
        enctr_frequency: 'Semanal',
        enctr_isactive: true,
      });
    }

    for (const ct of this.customTreatments()) {
      list.push({
        enctr_kind: 'CUSTOM_ADHOC',
        enctr_code: ct.id,
        enctr_name: ct.title,
        enctr_category: ct.category,
        enctr_targetzone: ct.zone,
        enctr_dosageparameters: ct.parameters,
        enctr_frequency: ct.frequency,
        enctr_homeprescription: ct.homeCare,
        enctr_isactive: true,
      });
    }

    return list;
  }
}
