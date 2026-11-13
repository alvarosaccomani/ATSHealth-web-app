import { PaginatedResult } from '@interfaces/common';
import { CompanyEntity } from './company.interface';

export interface CompanyResults extends PaginatedResult<CompanyEntity> {}
