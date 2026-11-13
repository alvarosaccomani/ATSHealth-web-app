import { PaginatedResult } from '@interfaces/common';
import { ItemInterface } from './item.interface';

/**
 * @description Respuesta paginada estándar para la lista de ítems maestros.
 */
export interface ItemResults extends PaginatedResult<ItemInterface> {}
