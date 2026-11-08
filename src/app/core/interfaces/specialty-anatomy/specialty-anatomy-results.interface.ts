import { PaginatedResult } from '@interfaces/common';
import { SpecialtyAnatomyConfig } from './specialty-anatomy.interface';

/**
 * @description Contrato estándar para respuestas paginadas de configuraciones anatómicas por especialidad.
 */
export interface SpecialtyAnatomyResults extends PaginatedResult<SpecialtyAnatomyConfig> {}
