import { CompanyEntity } from '../company';

export interface RolEntity {
  rol_uuid: string;
  rol_name: string;
  rol_createdat?: Date | string;
  rol_updatedat?: Date | string;
}

/**
 * @description Entidad de relación entre Usuario, Rol y Empresa/Clínica.
 */
export interface UserRolCompanyInterface {
  cmp_uuid: string;
  usr_uuid: string;
  rol_uuid: string;
  cmp?: CompanyEntity;
  rol?: RolEntity;
  usrrolcmp_createdat?: Date | string;
  usrrolcmp_updatedat?: Date | string;
}
