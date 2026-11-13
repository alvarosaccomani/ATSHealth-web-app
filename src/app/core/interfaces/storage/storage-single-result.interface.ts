import { SingleResult } from '@interfaces/common';
import { PresignedUploadData } from './storage.interface';

/**
 * @description Contrato estándar para respuestas unitarias de almacenamiento / storage.
 */
export interface StorageSingleResultInterface extends SingleResult<PresignedUploadData> {}
