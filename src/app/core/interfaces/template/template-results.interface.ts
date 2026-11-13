import { PaginatedResult } from '../common';
import { TemplateInterface } from './template.interface';

/**
 * @description Estructura de respuesta paginada para la entidad Template.
 */
export interface TemplateResults extends PaginatedResult<TemplateInterface> {}
