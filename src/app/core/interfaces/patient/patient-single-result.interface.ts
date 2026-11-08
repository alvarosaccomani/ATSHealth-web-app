import { SingleResult } from '../common';
import { PatientInterface } from './patient.interface';

/**
 * @description Estructura de respuesta unitaria para la entidad Patient.
 */
export interface PatientSingleResult extends SingleResult<PatientInterface> {}
