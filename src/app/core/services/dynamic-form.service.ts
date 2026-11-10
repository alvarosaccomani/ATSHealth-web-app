import { Injectable } from '@angular/core';
import {
  DynamicFieldOption,
  DynamicFieldSchema,
  DynamicSectionSchema,
  DynamicStageSchema,
  DynamicTemplateSchema,
} from '@interfaces/dynamic-form';

@Injectable({
  providedIn: 'root',
})
export class DynamicFormService {
  /**
   * @description Inicializa el árbol de datos a partir de los valores predeterminados (defaultValue) del esquema.
   * @param schema Esquema dinámico de la plantilla o null.
   * @returns Diccionario estructurado por etapa y sección con los valores por defecto.
   */
  initializeFormData(schema: DynamicTemplateSchema | null): Record<string, any> {
    if (!schema?.stages || !Array.isArray(schema.stages)) {
      return {};
    }

    const data: Record<string, any> = {};

    for (const stage of schema.stages) {
      data[stage.id] = this.initializeStageData(stage);
    }

    return data;
  }

  /**
   * @description Inicializa los datos para una etapa específica del esquema.
   */
  initializeStageData(stage: DynamicStageSchema): Record<string, any> {
    const stageData: Record<string, any> = {};

    if (!stage.sections || !Array.isArray(stage.sections)) {
      return stageData;
    }

    for (const section of stage.sections) {
      stageData[section.id] = this.initializeSectionData(section);
    }

    return stageData;
  }

  /**
   * @description Inicializa los datos para una sección específica del esquema.
   */
  initializeSectionData(section: DynamicSectionSchema): Record<string, any> {
    const sectionData: Record<string, any> = {};

    if (!section.fields || !Array.isArray(section.fields)) {
      return sectionData;
    }

    for (const field of section.fields) {
      sectionData[field.id] = this.resolveDefaultValue(field);
    }

    return sectionData;
  }

  /**
   * @description Resuelve el valor por defecto de un campo según su tipo y metadatos.
   */
  resolveDefaultValue(field: DynamicFieldSchema): any {
    if (field.defaultValue !== undefined && field.defaultValue !== null) {
      return field.defaultValue;
    }

    switch (field.type) {
      case 'boolean':
      case 'toggle':
      case 'checkbox':
        return false;
      case 'number':
      case 'range':
        return field.validation?.min ?? 0;
      case 'select':
      case 'radio':
      case 'radio_group':
        return field.options && field.options.length > 0 ? field.options[0].value : '';
      default:
        return '';
    }
  }

  /**
   * @description Obtiene una lista aplanada de todos los campos del esquema para indexación o búsqueda rápida.
   */
  flattenFields(schema: DynamicTemplateSchema): DynamicFieldSchema[] {
    const result: DynamicFieldSchema[] = [];
    if (!schema?.stages) return result;

    for (const stage of schema.stages) {
      if (!stage.sections) continue;
      for (const section of stage.sections) {
        if (!section.fields) continue;
        result.push(...section.fields);
      }
    }

    return result;
  }

  /**
   * @description Busca la definición de un campo por su identificador único.
   */
  findFieldById(schema: DynamicTemplateSchema, fieldId: string): DynamicFieldSchema | null {
    const all = this.flattenFields(schema);
    return all.find((f) => f.id === fieldId) || null;
  }

  /**
   * @description Evalúa si un campo debe mostrarse en función de sus dependencias lógicas (dependsOn).
   * @param field Campo a evaluar.
   * @param contextData Objeto de datos del contexto actual (sección o formulario global).
   */
  /**
   * @description Resuelve el valor de un campo desde el objeto de datos, soportando estructuras planas o anidadas.
   */
  resolveContextValue(fieldId: string, contextData: Record<string, any>): any {
    if (!contextData || typeof contextData !== 'object') {
      return undefined;
    }

    if (contextData[fieldId] !== undefined) {
      return contextData[fieldId];
    }

    for (const key of Object.keys(contextData)) {
      const val = contextData[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        if (val[fieldId] !== undefined) {
          return val[fieldId];
        }
        for (const subKey of Object.keys(val)) {
          const subVal = val[subKey];
          if (subVal && typeof subVal === 'object' && !Array.isArray(subVal) && subVal[fieldId] !== undefined) {
            return subVal[fieldId];
          }
        }
      }
    }

    return undefined;
  }

  /**
   * @description Evalúa si un campo debe ser visible en base a su regla dependsOn y el estado actual de datos.
   */
  evaluateVisibility(field: DynamicFieldSchema, contextData: Record<string, any>): boolean {
    if (!field.dependsOn) {
      return true;
    }

    const dep = field.dependsOn;
    const currentValue = this.resolveContextValue(dep.fieldId, contextData);

    if (dep.operator) {
      const targetVal = dep.value !== undefined ? dep.value : dep.equals;
      switch (dep.operator) {
        case 'equals':
          return currentValue == targetVal;
        case 'notEquals':
          return currentValue != targetVal;
        case 'greaterThan':
          return Number(currentValue) > Number(targetVal);
        case 'lessThan':
          return Number(currentValue) < Number(targetVal);
        case 'in':
          return Array.isArray(targetVal) ? targetVal.includes(currentValue) : false;
      }
    }

    if (dep.equals !== undefined) {
      return currentValue == dep.equals;
    }

    if (dep.notEquals !== undefined) {
      return currentValue != dep.notEquals;
    }

    if (dep.greaterThan !== undefined) {
      return Number(currentValue) > Number(dep.greaterThan);
    }

    if (dep.lessThan !== undefined) {
      return Number(currentValue) < Number(dep.lessThan);
    }

    if (dep.in && Array.isArray(dep.in)) {
      return dep.in.includes(currentValue);
    }

    return true;
  }

  /**
   * @description Calcula el Score del Cuestionario ICIQ-UI SF a partir del diccionario de datos.
   */
  calculateIciqScore(data: Record<string, any>): { score: number; severity: string } {
    const freq = Number(this.resolveContextValue('iciq_freq', data) ?? this.resolveContextValue('iciq_frequency', data) ?? 0);
    const vol = Number(this.resolveContextValue('iciq_vol', data) ?? this.resolveContextValue('iciq_amount', data) ?? 0);
    const impact = Number(this.resolveContextValue('iciq_impact', data) ?? 0);

    const score = freq + vol + impact;
    let severity = 'Sin Incontinencia';
    if (score > 0 && score <= 5) severity = 'Impacto Leve';
    else if (score <= 12) severity = 'Impacto Moderado';
    else if (score <= 18) severity = 'Impacto Severo';
    else if (score > 18) severity = 'Impacto Muy Severo';

    return { score, severity };
  }

  /**
   * @description Formatea el valor de un campo para presentación estética en modo lectura o informe PDF.
   */
  formatFieldValue(field: DynamicFieldSchema, value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'Sin registrar';
    }

    switch (field.type) {
      case 'boolean':
      case 'toggle':
      case 'checkbox':
        return value ? 'Sí' : 'No';

      case 'select':
      case 'radio':
      case 'radio_group': {
        const option = field.options?.find((opt: DynamicFieldOption) => opt.value === value);
        return option ? option.label : String(value);
      }

      case 'number':
      case 'range':
        return field.unit ? `${value} ${field.unit}` : String(value);

      default:
        return String(value);
    }
  }
}
