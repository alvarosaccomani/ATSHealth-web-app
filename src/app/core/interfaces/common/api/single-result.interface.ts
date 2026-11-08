/**
 * @description Contrato estándar genérico para respuestas de entidad única (getById, create, update).
 */
export interface SingleResult<T> {
  success?: boolean;
  message?: string;
  data: T;
}
