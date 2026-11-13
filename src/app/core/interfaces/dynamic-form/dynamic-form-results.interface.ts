import { PaginatedResult } from '@interfaces/common';
import { DynamicTemplateSchema } from './dynamic-form.interface';

/**
 * @description Respuesta paginada estándar para colecciones de esquemas dinámicos.
 */
export interface DynamicFormResults extends PaginatedResult<DynamicTemplateSchema> {}
