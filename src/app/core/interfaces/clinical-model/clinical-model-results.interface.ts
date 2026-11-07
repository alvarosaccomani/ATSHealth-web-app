import { PaginatedResult } from '@interfaces/common';
import { ClinicalModelInterface } from './clinical-model.interface';

/**
 * @description Estructura de respuesta paginada para la entidad ClinicalModel.
 */
export interface ClinicalModelResults extends PaginatedResult<ClinicalModelInterface> {}
