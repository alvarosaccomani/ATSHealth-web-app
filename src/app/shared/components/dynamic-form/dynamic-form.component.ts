import { Component, computed, inject, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DynamicSectionSchema,
  DynamicStageSchema,
  DynamicTemplateSchema,
} from '@interfaces/dynamic-form';
import { DynamicFieldComponent } from './dynamic-field/dynamic-field.component';
import { DynamicFormService } from '@services/dynamic-form.service';
import { Clinical3dViewerComponent } from '@components/clinical-3d-viewer/clinical-3d-viewer.component';
import { SelectedStructureEvent, SpecialtyAnatomyConfig } from '@interfaces/specialty-anatomy';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicFieldComponent, Clinical3dViewerComponent],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent {
  readonly dynamicFormService = inject(DynamicFormService);

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

  getSectionTheme(sec: DynamicSectionSchema) {
    return this.dynamicFormService.getThemeClasses(sec.colorTheme);
  }

  getTableRows(sec: DynamicSectionSchema): any[] {
    const d = this.data();
    if (d && Array.isArray(d[sec.id])) {
      return d[sec.id];
    }
    return sec.defaultRows || [];
  }

  updateTableCell(secId: string, rowIndex: number, colId: string, val: any): void {
    if (this.mode() === 'readonly') return;
    const current = { ...(this.data() || {}) };
    const rows = Array.isArray(current[secId]) ? [...current[secId]] : [];
    if (rows[rowIndex]) {
      rows[rowIndex] = { ...rows[rowIndex], [colId]: val };
      current[secId] = rows;
      this.data.set(current);
    }
  }

  addTableRow(sec: DynamicSectionSchema): void {
    if (this.mode() === 'readonly') return;
    const current = { ...(this.data() || {}) };
    const rows = Array.isArray(current[sec.id]) ? [...current[sec.id]] : [...(sec.defaultRows || [])];
    const newRow: Record<string, any> = { time: '08:00', intakeType: '', intakeVol: 0, voidVol: 0, urgency: '0', leak: false, activity: '' };
    rows.push(newRow);
    current[sec.id] = rows;
    this.data.set(current);
  }

  removeTableRow(secId: string, rowIndex: number): void {
    if (this.mode() === 'readonly') return;
    const current = { ...(this.data() || {}) };
    const rows = Array.isArray(current[secId]) ? [...current[secId]] : [];
    if (rows.length > 0) {
      rows.splice(rowIndex, 1);
      current[secId] = rows;
      this.data.set(current);
    }
  }

  getTableTotals(sec: DynamicSectionSchema) {
    return this.dynamicFormService.calculateTableTotals(this.getTableRows(sec));
  }

  getIciqCalculated() {
    return this.dynamicFormService.calculateIciqScore(this.data());
  }

  getSection3dConfig(sec: any): SpecialtyAnatomyConfig {
    const rawConfig = sec?.config || {};
    const structures: any[] = (rawConfig.structures || []).map((s: any) => ({
      meshId: s.meshId,
      label: s.label,
      layerId: s.layerId || 'deep',
      evalType: s.evalType || 'OXFORD',
    }));

    return {
      specialtyCode: rawConfig.specialtyCode || 'PELVIC_FLOOR',
      modelUrl: rawConfig.modelUrl || '/assets/models/body_human.glb',
      camera: rawConfig.camera || {
        position: { x: 0, y: 0.3, z: 2.2 },
        target: { x: 0, y: 0, z: 0 },
        fov: 45,
      },
      visibleMeshTokens: rawConfig.visibleMeshTokens || [
        'pubococcygeus',
        'iliococcygeus',
        'puborectalis',
        'pelvis',
        'sacrum',
        'coccyx',
        'ischium',
      ],
      structures: structures.length > 0 ? structures : [
        { meshId: 'Pubococcygeus muscle.l', label: 'M. Pubococcígeo Izq.', layerId: 'deep', evalType: 'OXFORD' },
        { meshId: 'Pubococcygeus muscle.r', label: 'M. Pubococcígeo Der.', layerId: 'deep', evalType: 'OXFORD' },
        { meshId: 'Iliococcygeus muscle.l', label: 'M. Iliococcígeo Izq.', layerId: 'deep', evalType: 'OXFORD' },
        { meshId: 'Iliococcygeus muscle.r', label: 'M. Iliococcígeo Der.', layerId: 'deep', evalType: 'OXFORD' },
      ],
    };
  }

  onStructure3dClicked(secId: string, evt: SelectedStructureEvent): void {
    if (this.mode() === 'readonly') return;
    const current = { ...(this.data() || {}) };
    const highlights = { ...(current[secId] || {}) };
    highlights[evt.meshId] = '#38bdf8';
    current[secId] = highlights;
    this.data.set(current);
  }

  getStandardModalities(sec: any): any[] {
    const current = this.data();
    if (current && Array.isArray(current['standard_modalities'])) {
      return current['standard_modalities'];
    }
    return sec.standardOptions || [];
  }

  toggleModality(modalityId: string, sec?: any): void {
    if (this.mode() === 'readonly') return;
    const current = { ...(this.data() || {}) };
    const list = this.getStandardModalities(sec).map((item: any) => ({ ...item }));
    const found = list.find((m: any) => m.id === modalityId);
    if (found) {
      found.checked = !found.checked;
      current['standard_modalities'] = list;
      this.data.set(current);
    }
  }

  updateModalityField(modalityId: string, fieldKey: string, val: any, sec?: any): void {
    if (this.mode() === 'readonly') return;
    const current = { ...(this.data() || {}) };
    const list = this.getStandardModalities(sec).map((item: any) => ({ ...item }));
    const found = list.find((m: any) => m.id === modalityId);
    if (found && found.fields) {
      const f = found.fields.find((fld: any) => fld.key === fieldKey);
      if (f) {
        f.defaultValue = val;
      }
      current['standard_modalities'] = list;
      this.data.set(current);
    }
  }
}
