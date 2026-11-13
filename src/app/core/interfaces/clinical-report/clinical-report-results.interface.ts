import { PaginatedResult } from '@interfaces/common';
import { ClinicalReportInterface } from './clinical-report.interface';

/**
 * @description Respuesta paginada estándar para informes clínicos.
 */
export interface ClinicalReportResults extends PaginatedResult<ClinicalReportInterface> {}
