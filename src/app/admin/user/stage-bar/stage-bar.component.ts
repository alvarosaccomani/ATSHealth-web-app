import { Component, computed, input, model, output } from '@angular/core';

export interface StageItem {
  id: number;
  tag: string;
  label: string;
}

@Component({
  selector: 'app-stage-bar',
  imports: [],
  templateUrl: './stage-bar.component.html',
  styleUrl: './stage-bar.component.scss',
})
export class StageBarComponent {
  readonly currentStage = model<number>(1);
  readonly customStages = input<StageItem[] | null>(null);
  readonly stageChange = output<number>();

  private readonly defaultStages: StageItem[] = [
    { id: 1, tag: 'Etapa 1', label: 'Anamnesis & Tests' },
    { id: 2, tag: 'Etapa 2', label: 'Examen Físico Funcional' },
    { id: 3, tag: 'Etapa 3', label: 'Plan de Tratamiento' },
    { id: 4, tag: 'Etapa 4', label: 'Evolución & Métricas' },
  ];

  readonly stages = computed<StageItem[]>(() => {
    const custom = this.customStages();
    return custom && custom.length > 0 ? custom : this.defaultStages;
  });

  selectStage(stageId: number): void {
    if (this.currentStage() === stageId) return;
    this.currentStage.set(stageId);
    this.stageChange.emit(stageId);
  }
}
