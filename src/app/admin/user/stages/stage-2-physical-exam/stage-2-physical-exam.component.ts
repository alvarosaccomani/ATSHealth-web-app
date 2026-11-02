import { Component, output, signal } from '@angular/core';

export interface OxfordItem {
  grade: number;
  label: string;
  desc: string;
}

@Component({
  selector: 'app-stage-2-physical-exam',
  imports: [],
  templateUrl: './stage-2-physical-exam.component.html',
  styleUrl: './stage-2-physical-exam.component.scss',
})
export class Stage2PhysicalExamComponent {
  readonly prevStage = output<number>();
  readonly nextStage = output<number>();

  // Escala Oxford
  readonly oxfordGrade = signal<number>(2);

  readonly oxfordGrades: OxfordItem[] = [
    { grade: 0, label: 'Grado 0', desc: 'Sin contracción' },
    { grade: 1, label: 'Grado 1', desc: 'Parpadeo / Esbozo' },
    { grade: 2, label: 'Grado 2', desc: 'Débil sin elevación' },
    { grade: 3, label: 'Grado 3', desc: 'Moderada con ascenso' },
    { grade: 4, label: 'Grado 4', desc: 'Buena contra resist.' },
    { grade: 5, label: 'Grado 5', desc: 'Fuerte / Potente' },
  ];

  // Esquema PERFECT
  readonly perfectP = signal<number>(2);
  readonly perfectE = signal<number>(4);
  readonly perfectR = signal<number>(3);
  readonly perfectF = signal<number>(4);

  selectOxfordGrade(grade: number): void {
    this.oxfordGrade.set(grade);
    this.perfectP.set(grade);
  }

  goToPrev(): void {
    this.prevStage.emit(1);
  }

  goToNext(): void {
    this.nextStage.emit(3);
  }
}
