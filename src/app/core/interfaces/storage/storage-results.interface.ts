import { PaginatedResult } from '@interfaces/common';
import { PresignedUploadData } from './storage.interface';

/**
 * @description Contrato estándar para respuestas paginadas de almacenamiento / storage.
 */
export interface StorageResultsInterface extends PaginatedResult<PresignedUploadData> {}
