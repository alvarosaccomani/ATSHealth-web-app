export interface ClinicalReportHeader {
  clinicName: string;
  clinicAddress?: string | null;
  clinicPhone?: string | null;
  clinicEmail?: string | null;
  clinicLogo?: string | null;
}

export interface ClinicalReportPatient {
  patUuid: string;
  fullName: string;
  documentNumber: string;
  birthDate?: string | null;
  age?: number | null;
  biologicalSex?: string | null;
  medicalCoverage?: string | null;
  affiliateNumber?: string | null;
  occupation?: string | null;
}

export interface ClinicalReportMetadata {
  encUuid: string;
  sessionNumber: number;
  consultDate: string;
  consultReason?: string | null;
  consultGoal?: string | null;
  status: 'IN_PROGRESS' | 'SIGNED_LOCKED' | 'VOID' | string;
  templateCode?: string | null;
  templateName?: string | null;
  templateVersion?: string | null;
  practitionerName: string;
  practitionerLicense?: string | null;
  signedAt?: string | null;
  signedBy?: string | null;
}

export interface ClinicalReportTreatmentItem {
  name: string;
  dosageParameters: string;
  homePrescription?: string | null;
  targetZone?: string | null;
}

/**
 * @description Modelo de datos consolidado para la emisión de informes clínicos y epicrisis.
 */
export interface ClinicalReportInterface {
  header: ClinicalReportHeader;
  patient: ClinicalReportPatient;
  metadata: ClinicalReportMetadata;
  formData: Record<string, any>;
  calculatedScores?: Record<string, any>;
  treatments?: ClinicalReportTreatmentItem[];
  generatedAt: string;
}
