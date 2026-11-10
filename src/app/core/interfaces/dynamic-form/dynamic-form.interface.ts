export type DynamicFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'range'
  | 'select'
  | 'radio'
  | 'radio_group'
  | 'boolean'
  | 'toggle'
  | 'checkbox'
  | 'date'
  | 'score_calculator'
  | 'custom_widget'
  | string;

export interface DynamicFieldOption {
  label: string;
  value: any;
  score?: number;
  badge?: string;
  description?: string;
  icon?: string;
}

export interface DynamicFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
}

export interface DynamicFieldDependency {
  fieldId: string;
  equals?: any;
  in?: any[];
}

export interface DynamicFieldSchema {
  id: string;
  label: string;
  type: DynamicFieldType;
  placeholder?: string;
  defaultValue?: any;
  options?: DynamicFieldOption[];
  unit?: string;
  helpText?: string;
  dependsOn?: DynamicFieldDependency;
  colSpan?: number;
  validation?: DynamicFieldValidation;
  extraConfig?: Record<string, any>;
}

export interface DynamicSectionSchema {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  columns?: number;
  fields: DynamicFieldSchema[];
}

export interface DynamicStageSchema {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  icon?: string;
  sections: DynamicSectionSchema[];
}

/**
 * @description Estructura canónica del esquema JSONB de una plantilla clínica dinámica.
 */
export interface DynamicTemplateSchema {
  templateId: string;
  name: string;
  code: string;
  specialty?: string;
  version: string;
  icon?: string;
  description?: string;
  stages: DynamicStageSchema[];
  extraSettings?: Record<string, any>;
}
