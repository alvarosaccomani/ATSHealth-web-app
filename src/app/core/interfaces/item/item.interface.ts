/**
 * @description Modelo de entidad maestro para ítems y servicios médicos del sistema.
 */
export interface ItemInterface {
  itm_uuid: string;
  itm_name: string;
  itm_description?: string | null;
  itm_createdat?: Date | string;
  itm_updatedat?: Date | string;
}

/**
 * @description DTO para la creación de un nuevo ítem maestro.
 */
export interface CreateItemDto {
  itm_name: string;
  itm_description?: string | null;
}

/**
 * @description DTO para la actualización de un ítem maestro existente.
 */
export interface UpdateItemDto {
  itm_name?: string;
  itm_description?: string | null;
}

