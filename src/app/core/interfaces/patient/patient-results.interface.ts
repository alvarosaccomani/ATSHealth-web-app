import { PaginatedResult } from '../common';
import { PatientInterface } from './patient.interface';

/**
 * @description Estructura de respuesta paginada para la entidad Patient.
 */
export interface PatientResults extends PaginatedResult<PatientInterface> {}
