import { PaginatedResult } from '@interfaces/common';
import { EncounterInterface } from './encounter.interface';

/**
 * @description Respuesta paginada estándar para consultas clínicas.
 */
export interface EncounterResults extends PaginatedResult<EncounterInterface> {}
