export interface CompanyEntity {
  cmp_uuid: string;
  cmp_name: string;
  cmp_address?: string;
  cmp_phone?: string;
  cmp_email?: string;
  cmp_slug?: string;
  cmp_logo?: string;
  cmp_status?: string;
  cmp_createdat?: Date | string;
  cmp_updatedat?: Date | string;
}

export interface CompanyInterface extends CompanyEntity {}
