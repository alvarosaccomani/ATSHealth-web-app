import { PaginatedResult } from '@interfaces/common';
import { CompanyItemInterface } from './company-item.interface';

/**
 * @description Respuesta paginada estándar para la lista de company-items.
 */
export interface CompanyItemResults extends PaginatedResult<CompanyItemInterface> {}
