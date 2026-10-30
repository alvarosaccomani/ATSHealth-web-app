export interface CompanyEntity {
  cmp_uuid: string;
  cmp_name: string;
  cmp_address?: string | null;
  cmp_lat?: number | null;
  cmp_lng?: number | null;
  cmp_phone?: string | null;
  cmp_email?: string | null;
  cmp_logo?: string | null;
  cmp_banner?: string | null;
  cmp_description?: string | null;
  cmp_whatsapp?: string | null;
  cmp_instagram?: string | null;
  cmp_facebook?: string | null;
  cmp_primarycolor?: string | null;
  cmp_isfeatured?: boolean | null;
  cmp_status?: string;
  cmp_createdat?: Date | string;
  cmp_updatedat?: Date | string;
  companySettings?: any[];
}

export interface CompanyInterface extends CompanyEntity {}
