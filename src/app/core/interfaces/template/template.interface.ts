import { DynamicTemplateSchema } from '@interfaces/dynamic-form';

export interface TemplateInterface {
  cmp_uuid: string;
  tpl_uuid: string;
  itm_uuid: string;
  cmpitm_uuid: string;
  tplsys_uuid?: string | null;
  tpl_code: string;
  tpl_name: string;
  tpl_version: string;
  tpl_schema: DynamicTemplateSchema | Record<string, any>;
  tpl_isactive: boolean;
  tpl_createdat?: Date | string;
  tpl_updatedat?: Date | string;
}

export interface TemplateCreateInput {
  cmp_uuid: string;
  tpl_uuid?: string;
  itm_uuid?: string;
  cmpitm_uuid?: string;
  tplsys_uuid?: string | null;
  tpl_code: string;
  tpl_name: string;
  tpl_version?: string;
  tpl_schema: Record<string, any>;
  tpl_isactive?: boolean;
}

export interface TemplateUpdateInput {
  tpl_name?: string;
  tpl_code?: string;
  tpl_version?: string;
  tpl_schema?: Record<string, any>;
  tpl_isactive?: boolean;
}
