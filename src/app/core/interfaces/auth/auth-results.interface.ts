import { PaginatedResult } from '@interfaces/common';
import { AuthData } from './auth.interface';

/**
 * @description Contrato estándar para respuestas paginadas de autenticación (requerido por convención de scaffolding).
 */
export interface AuthResults extends PaginatedResult<AuthData> {}
