import { Component, output, signal } from '@angular/core';
import { Clinical3dViewerComponent } from '@components/clinical-3d-viewer/clinical-3d-viewer.component';
import {
  SelectedStructureEvent,
  SpecialtyAnatomyConfig,
} from '@interfaces/specialty-anatomy';

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

  // Configuración de visor 3D para Suelo Pélvico con Universal Model y Mesh Whitelisting
  readonly pelvic3dConfig: SpecialtyAnatomyConfig = {
    specialtyCode: 'PELVIC_FLOOR',
    modelUrl: '/assets/models/body_human.glb',
    camera: {
      position: { x: 0, y: 0.3, z: 2.2 },
      target: { x: 0, y: 0, z: 0 },
      fov: 45,
    },
    visibleMeshTokens: [
      'pubococcygeus',
      'iliococcygeus',
      'levator ani',
      'coccygeus',
      'obturator internus',
      'piriformis',
      'hip bone',
      'sacrum',
      'pelvic',
      'ilium',
      'pubis',
      'ischium',
    ],
    structures: [
      {
        meshId: 'Pubococcygeus muscle.l',
        label: 'M. Pubococcígeo Izq.',
        layerId: 'deep',
        evalType: 'OXFORD',
      },
      {
        meshId: 'Pubococcygeus muscle.r',
        label: 'M. Pubococcígeo Der.',
        layerId: 'deep',
        evalType: 'OXFORD',
      },
      {
        meshId: 'Iliococcygeus muscle.l',
        label: 'M. Iliococcígeo Izq.',
        layerId: 'deep',
        evalType: 'OXFORD',
      },
      {
        meshId: 'Iliococcygeus muscle.r',
        label: 'M. Iliococcígeo Der.',
        layerId: 'deep',
        evalType: 'OXFORD',
      },
      {
        meshId: 'Obturator internus.l',
        label: 'M. Obturador Interno Izq.',
        layerId: 'intermediate',
        evalType: 'EVA',
      },
      {
        meshId: 'Obturator internus.r',
        label: 'M. Obturador Interno Der.',
        layerId: 'intermediate',
        evalType: 'EVA',
      },
      {
        meshId: 'Coccygeus muscle.l',
        label: 'M. Coccígeo Izq.',
        layerId: 'deep',
        evalType: 'OXFORD',
      },
      {
        meshId: 'Coccygeus muscle.r',
        label: 'M. Coccígeo Der.',
        layerId: 'deep',
        evalType: 'OXFORD',
      },
    ],
    layers: [
      {
        id: 'bone',
        label: 'Plano Óseo (Pelvis)',
        defaultVisible: true,
        baseColor: '#e2dac7',
      },
      {
        id: 'intermediate',
        label: 'Plano Medio',
        defaultVisible: true,
        baseColor: '#d97706',
      },
      {
        id: 'deep',
        label: 'Plano Profundo (Elevador)',
        defaultVisible: true,
        baseColor: '#b85050',
      },
    ],
    palette: {
      bone: '#e2dac7',
      muscle: '#b85050',
      ligament: '#94a3b8',
    },
  };

  readonly active3dHighlights = signal<Record<string, string>>({
    'Pubococcygeus muscle.l': '#ef4444',
    'Obturator internus.l': '#f97316',
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
