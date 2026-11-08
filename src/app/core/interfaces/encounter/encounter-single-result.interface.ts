import { SingleResult } from '@interfaces/common';
import { EncounterInterface } from './encounter.interface';

/**
 * @description Respuesta de consulta médica única (getById, create, update).
 */
export interface EncounterSingleResult extends SingleResult<EncounterInterface> {}
