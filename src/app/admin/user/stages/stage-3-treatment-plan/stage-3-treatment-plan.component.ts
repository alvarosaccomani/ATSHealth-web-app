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
}
