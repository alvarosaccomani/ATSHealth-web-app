/**
 * @description Contrato estándar y genérico para cualquier respuesta paginada de la API.
 */
export interface PaginatedResult<T> {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: T[];
}
