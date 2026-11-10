import { Component, computed, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DynamicSectionSchema,
  DynamicStageSchema,
  DynamicTemplateSchema,
} from '@interfaces/dynamic-form';
import { DynamicFieldComponent } from './dynamic-field/dynamic-field.component';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, DynamicFieldComponent],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent {
  readonly schema = input<DynamicTemplateSchema | null>(null);
  readonly stage = input<DynamicStageSchema | null>(null);
  readonly section = input<DynamicSectionSchema | null>(null);

  /**
   * @description Modelo bidireccional que contiene las respuestas de los campos.
   */
  readonly data = model<Record<string, any>>({});

  /**
   * @description Modo de presentación: 'edit' para atención clínica, 'readonly' para reporte o consulta firmada.
   */
  readonly mode = input<'edit' | 'readonly'>('edit');

  readonly sectionsToRender = computed<DynamicSectionSchema[]>(() => {
    const singleSection = this.section();
    if (singleSection) {
      return [singleSection];
    }

    const singleStage = this.stage();
    if (singleStage?.sections) {
      return singleStage.sections;
    }

    const fullSchema = this.schema();
    if (fullSchema?.stages) {
      const accumulated: DynamicSectionSchema[] = [];
      for (const st of fullSchema.stages) {
        if (st.sections) {
          accumulated.push(...st.sections);
        }
      }
      return accumulated;
    }

    return [];
  });

  getGridColumnsClass(cols?: number): string {
    switch (cols) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  }

  getFieldValue(fieldId: string): any {
    const currentData = this.data();
    return currentData ? currentData[fieldId] : undefined;
  }

  setFieldValue(fieldId: string, val: any): void {
    const current = { ...(this.data() || {}) };
    current[fieldId] = val;
    this.data.set(current);
  }
}
