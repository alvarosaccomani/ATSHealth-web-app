export interface ItemSummaryInterface {
  itm_uuid: string;
  itm_name: string;
  itm_description?: string | null;
  itm_createdat?: Date | string;
  itm_updatedat?: Date | string;
}

/**
 * @description Modelo de asignación de ítem/servicio médico a una empresa/clínica.
 */
export interface CompanyItemInterface {
  cmp_uuid: string;
  itm_uuid: string;
  cmpitm_uuid: string;
  itm?: ItemSummaryInterface;
  cmpitm_createdat?: Date | string;
  cmpitm_updatedat?: Date | string;
}
