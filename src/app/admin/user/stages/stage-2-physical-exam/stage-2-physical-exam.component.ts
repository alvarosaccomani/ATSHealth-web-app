import { Component, output, signal } from '@angular/core';
import { Clinical3dViewerComponent } from '@components/clinical-3d-viewer/clinical-3d-viewer.component';
import {
  AnatomyConfig,
  SelectedStructureEvent,
} from '@interfaces/clinical-model';

export interface OxfordItem {
  grade: number;
  label: string;
  desc: string;
}

@Component({
  selector: 'app-stage-2-physical-exam',
  imports: [Clinical3dViewerComponent],
  templateUrl: './stage-2-physical-exam.component.html',
  styleUrl: './stage-2-physical-exam.component.scss',
})
export class Stage2PhysicalExamComponent {
  readonly prevStage = output<number>();
  readonly nextStage = output<number>();

  // Configuración de visor 3D para Suelo Pélvico
  readonly pelvic3dConfig: AnatomyConfig = {
    specialtyCode: 'pelvic_floor',
    modelUrl: '/assets/models/pelvic_floor_female.glb',
    cameraPosition: { x: 0, y: 1.5, z: 3.5 },
    structures: [
      {
        meshId: 'puborectalis',
        label: 'M. Puborrectal',
        layer: 'deep',
        evalType: 'oxford',
      },
      {
        meshId: 'pubococcygeus',
        label: 'M. Pubococcígeo',
        layer: 'deep',
        evalType: 'oxford',
      },
      {
        meshId: 'iliococcygeus',
        label: 'M. Iliococcígeo',
        layer: 'deep',
        evalType: 'oxford',
      },
      {
        meshId: 'obturator_internus_l',
        label: 'M. Obturador Interno Izq.',
        layer: 'intermediate',
        evalType: 'eva',
      },
      {
        meshId: 'obturator_internus_r',
        label: 'M. Obturador Interno Der.',
        layer: 'intermediate',
        evalType: 'eva',
      },
      {
        meshId: 'bulbospongiosus',
        label: 'M. Bulboesponjoso',
        layer: 'superficial',
      },
      {
        meshId: 'ischiocavernosus',
        label: 'M. Isquiocavernoso',
        layer: 'superficial',
      },
    ],
    layers: [
      { id: 'superficial', label: 'Plano Superficial', visible: true },
      { id: 'intermediate', label: 'Plano Medio', visible: true },
      { id: 'deep', label: 'Plano Profundo (Elevador)', visible: true },
    ],
  };

  readonly active3dHighlights = signal<Record<string, string>>({
    puborectalis: '#ef4444',
    obturator_internus_l: '#f97316',
  });

  readonly selectedStructure = signal<SelectedStructureEvent | null>(null);

  onStructureClick(event: SelectedStructureEvent): void {
    this.selectedStructure.set(event);
  }

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

  getData(): Record<string, any> {
    return {
      oxfordGrade: this.oxfordGrade(),
      perfect: {
        power: this.perfectP(),
        endurance: this.perfectE(),
        repetitions: this.perfectR(),
        fast: this.perfectF(),
      },
    };
  }

  hydrateData(data: Record<string, any>): void {
    if (!data) return;
    if (typeof data['oxfordGrade'] === 'number') {
      this.oxfordGrade.set(data['oxfordGrade']);
    }
    if (data['perfect']) {
      if (typeof data['perfect'].power === 'number') this.perfectP.set(data['perfect'].power);
      if (typeof data['perfect'].endurance === 'number') this.perfectE.set(data['perfect'].endurance);
      if (typeof data['perfect'].repetitions === 'number') this.perfectR.set(data['perfect'].repetitions);
      if (typeof data['perfect'].fast === 'number') this.perfectF.set(data['perfect'].fast);
    }
  }
}
