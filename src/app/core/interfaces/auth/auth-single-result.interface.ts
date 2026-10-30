import { SingleResult } from '@interfaces/common';
import { AuthData } from './auth.interface';

/**
 * @description Contrato estándar para la respuesta unitaria de autenticación.
 */
export interface AuthSingleResult extends SingleResult<AuthData> {}
