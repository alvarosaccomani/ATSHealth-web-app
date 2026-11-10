import { Component, computed, inject, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicFieldOption, DynamicFieldSchema } from '@interfaces/dynamic-form';
import { DynamicFormService } from '@services/dynamic-form.service';
import { Clinical3dViewerComponent } from '@components/clinical-3d-viewer/clinical-3d-viewer.component';
import { SelectedStructureEvent, SpecialtyAnatomyConfig } from '@interfaces/specialty-anatomy';

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [CommonModule, FormsModule, Clinical3dViewerComponent],
  templateUrl: './dynamic-field.component.html',
  styleUrl: './dynamic-field.component.scss',
})
export class DynamicFieldComponent {
  readonly dynamicFormService = inject(DynamicFormService);

  readonly field = input.required<DynamicFieldSchema>();
  readonly value = model<any>();
  readonly mode = input<'edit' | 'readonly'>('edit');
  readonly contextData = input<Record<string, any>>({});

  readonly isVisible = computed(() => {
    return this.dynamicFormService.evaluateVisibility(this.field(), this.contextData());
  });

  readonly formattedValue = computed(() => {
    return this.dynamicFormService.formatFieldValue(this.field(), this.value());
  });

  readonly colSpanClass = computed(() => {
    const type = this.field().type;
    if (type === 'pelvis_3d_viewer' || type === 'bristol_scale' || type === 'consent_box') {
      return 'col-span-full';
    }
    const span = this.field().colSpan;
    switch (span) {
      case 2:
        return 'col-span-1 sm:col-span-2';
      case 3:
        return 'col-span-1 sm:col-span-2 lg:col-span-3';
      case 4:
        return 'col-span-1 sm:col-span-2 lg:col-span-4';
      default:
        return 'col-span-1';
    }
  });

  readonly bristolTypes = [
    { type: 1, emoji: '🌰', title: 'Tipo 1', desc: 'Bolas duras separadas (nuez)', badge: 'Estreñimiento Severo', badgeClass: 'text-rose-600 dark:text-rose-400' },
    { type: 2, emoji: '🥔', title: 'Tipo 2', desc: 'Salchicha grumosa apelmazada', badge: 'Estreñimiento Leve', badgeClass: 'text-amber-600 dark:text-amber-400' },
    { type: 3, emoji: '🥖', title: 'Tipo 3', desc: 'Salchicha con grietas', badge: 'Normal / Aceptable', badgeClass: 'text-emerald-600 dark:text-emerald-400' },
    { type: 4, emoji: '🐍', title: 'Tipo 4', desc: 'Salchicha suave y lisa', badge: 'Ideal / Óptimo', badgeClass: 'text-emerald-600 dark:text-emerald-400' },
    { type: 5, emoji: '🥟', title: 'Tipo 5', desc: 'Trozos blandos con bordes claros', badge: 'Falta de fibra', badgeClass: 'text-slate-400 dark:text-slate-500' },
    { type: 6, emoji: '🥣', title: 'Tipo 6', desc: 'Fragmentos pastosos deshechos', badge: 'Diarrea Ligera', badgeClass: 'text-amber-600 dark:text-amber-400' },
    { type: 7, emoji: '🌊', title: 'Tipo 7', desc: 'Totalmente líquida sin sólidos', badge: 'Diarrea Severa', badgeClass: 'text-rose-600 dark:text-rose-400' },
  ];

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
      { meshId: 'Pubococcygeus muscle.l', label: 'M. Pubococcígeo Izq.', layerId: 'deep', evalType: 'OXFORD' },
      { meshId: 'Pubococcygeus muscle.r', label: 'M. Pubococcígeo Der.', layerId: 'deep', evalType: 'OXFORD' },
      { meshId: 'Iliococcygeus muscle.l', label: 'M. Iliococcígeo Izq.', layerId: 'deep', evalType: 'OXFORD' },
      { meshId: 'Iliococcygeus muscle.r', label: 'M. Iliococcígeo Der.', layerId: 'deep', evalType: 'OXFORD' },
    ],
  };

  onSelectOption(opt: DynamicFieldOption): void {
    if (this.mode() === 'readonly') return;
    this.value.set(opt.value);
  }

  selectBristol(type: number): void {
    if (this.mode() === 'readonly') return;
    this.value.set(type);
  }

  onStructureClicked(evt: SelectedStructureEvent): void {
    if (this.mode() === 'readonly') return;
    const current = this.value() || {};
    this.value.set({ ...current, [evt.meshId]: '#38bdf8' });
  }
}