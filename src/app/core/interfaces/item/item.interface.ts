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
