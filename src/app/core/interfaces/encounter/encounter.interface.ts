export interface EncounterDataInterface {
  cmp_uuid: string;
  enc_uuid: string;
  encd_formdata: Record<string, any>;
  encd_calculatedscores: Record<string, any>;
  encd_version?: number;
  encd_createdat?: Date | string;
  encd_updatedat?: Date | string;
}

export interface EncounterTreatmentInterface {
  cmp_uuid: string;
  enc_uuid: string;
  enctr_uuid: string;
  enctr_kind: 'STANDARD_MODALITY' | 'CUSTOM_ADHOC' | string;
  enctr_code?: string | null;
  enctr_name: string;
  enctr_category?: string | null;
  enctr_targetzone?: string | null;
  enctr_dosageparameters: string;
  enctr_frequency?: string | null;
  enctr_homeprescription?: string | null;
  enctr_isactive: boolean;
  enctr_createdat?: Date | string;
  enctr_updatedat?: Date | string;
}

export interface EncounterInterface {
  cmp_uuid: string;
  enc_uuid: string;
  pat_uuid: string;
  usr_uuid_practitioner: string;
  tpl_uuid?: string | null;
  bkg_uuid?: string | null;
  wrk_uuid?: string | null;
  enc_number: number;
  enc_type: 'FIRST_TIME' | 'FOLLOW_UP' | 'DISCHARGE' | string;
  enc_date: Date | string;
  enc_status: 'IN_PROGRESS' | 'SIGNED_LOCKED' | 'VOID' | string;
  enc_reason?: string | null;
  enc_maindiagnosiscode?: string | null;
  enc_signedat?: Date | string | null;
  enc_signedby?: string | null;
  enc_createdat?: Date | string;
  enc_updatedat?: Date | string;

  // Detalles asociados
  encounter_data?: EncounterDataInterface | null;
  treatments?: EncounterTreatmentInterface[];
  practitioner?: {
    usr_uuid: string;
    usr_name: string;
    usr_surname: string;
  };
}

export interface CreateEncounterPayload {
  cmp_uuid: string;
  enc_uuid?: string;
  pat_uuid: string;
  usr_uuid_practitioner?: string;
  tpl_uuid?: string | null;
  enc_number?: number;
  enc_type?: string;
  enc_date?: string;
  enc_status?: string;
  enc_reason?: string | null;
  enc_maindiagnosiscode?: string | null;

  form_data?: Record<string, any>;
  calculated_scores?: Record<string, any>;
  treatments?: Array<{
    enctr_kind?: string;
    enctr_code?: string | null;
    enctr_name: string;
    enctr_category?: string | null;
    enctr_targetzone?: string | null;
    enctr_dosageparameters: string;
    enctr_frequency?: string | null;
    enctr_homeprescription?: string | null;
    enctr_isactive?: boolean;
  }>;
}
