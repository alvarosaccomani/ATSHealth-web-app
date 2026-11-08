import { CompanyEntity } from '../company';

export interface RolEntity {
  rol_uuid: string;
  rol_name: string;
  rol_createdat?: Date | string;
  rol_updatedat?: Date | string;
}

export interface UserSummaryEntity {
  usr_uuid: string;
  usr_name: string;
  usr_surname: string;
  usr_email: string;
  usr_nick: string;
  usr_image?: string | null;
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
  usr?: UserSummaryEntity;
  usrrolcmp_createdat?: Date | string;
  usrrolcmp_updatedat?: Date | string;
}
