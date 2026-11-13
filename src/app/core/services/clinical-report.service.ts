import { Injectable, inject, signal } from '@angular/core';
import { CompanyContextService } from '@services/company-context.service';
import { PatientsService } from '@services/patients.service';
import { EncountersService } from '@services/encounters.service';
import { TemplatesService } from '@services/templates.service';
import { AuthService } from '@services/auth.service';
import { EncounterInterface } from '@interfaces/encounter';
import {
  ClinicalReportHeader,
  ClinicalReportInterface,
  ClinicalReportMetadata,
  ClinicalReportPatient,
  ClinicalReportTreatmentItem,
} from '@interfaces/clinical-report';

@Injectable({
  providedIn: 'root',
})
export class ClinicalReportService {
  private readonly companyContext = inject(CompanyContextService);
  private readonly patientsService = inject(PatientsService);
  private readonly encountersService = inject(EncountersService);
  private readonly templatesService = inject(TemplatesService);
  private readonly authService = inject(AuthService);

  readonly isReportModalOpen = signal<boolean>(false);
  readonly activeReportData = signal<ClinicalReportInterface | null>(null);

  /**
   * @description Abre el informe médico consolidando los datos actuales de la clínica, paciente y encuentro.
   * @param targetEncounter Opcional. Si se omite, toma el encuentro activo en memoria.
   */
  openReport(targetEncounter?: EncounterInterface | null): void {
    const report = this.buildReportData(targetEncounter);
    if (report) {
      this.activeReportData.set(report);
      this.isReportModalOpen.set(true);
    }
  }

  /**
   * @description Cierra el visor de informe médico.
   */
  closeReport(): void {
    this.isReportModalOpen.set(false);
  }

  /**
   * @description Dispara la impresión nativa del informe / guardado a PDF.
   */
  printReport(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  /**
   * @description Ensambla el modelo consolidado ClinicalReportInterface a partir de los servicios de dominio.
   */
  buildReportData(targetEncounter?: EncounterInterface | null): ClinicalReportInterface | null {
    const cmp = this.companyContext.activeCompany();
    const pat = this.patientsService.activePatient();
    const enc = targetEncounter ?? this.encountersService.activeEncounter();
    const tpl = this.templatesService.activeTemplate();
    const user = this.authService.currentUser();

    if (!pat) {
      return null;
    }

    // 1. Membrete Institucional
    const header: ClinicalReportHeader = {
      clinicName: cmp?.cmp_name || 'Clínica de Rehabilitación y Salud',
      clinicAddress: cmp?.cmp_address || null,
      clinicPhone: cmp?.cmp_phone || null,
      clinicEmail: cmp?.cmp_email || null,
      clinicLogo: null,
    };

    // 2. Ficha Filiatoria del Paciente
    const patient: ClinicalReportPatient = {
      patUuid: pat.pat_uuid,
      fullName: `${pat.pat_firstname} ${pat.pat_lastname}`.trim(),
      documentNumber: pat.pat_documentnumber || '-',
      birthDate: pat.pat_birthdate ? String(pat.pat_birthdate).split('T')[0] : null,
      age: pat.pat_birthdate ? this.patientsService.calculateAge(pat.pat_birthdate) : null,
      biologicalSex: pat.pat_biologicalsex || 'femenino',
      medicalCoverage: pat.pat_medicalcoverage || 'Particular',
      affiliateNumber: pat.pat_affiliatenumber || null,
      occupation: pat.pat_occupation || null,
    };

    // 3. Metadatos de la Atención y Firma Legal
    const practitionerName = enc?.practitioner
      ? `Lic. ${enc.practitioner.usr_name} ${enc.practitioner.usr_surname}`
      : user
      ? `Lic. ${user.usr_name || ''} ${user.usr_surname || ''}`.trim()
      : 'Lic. Profesional';

    const rawFormData = enc?.encounter_data?.encd_formdata || {};
    const metaSnapshot = rawFormData['_meta'];

    const metadata: ClinicalReportMetadata = {
      encUuid: enc?.enc_uuid || '',
      sessionNumber: enc?.enc_number || 1,
      consultDate: enc?.enc_date
        ? String(enc.enc_date).split('T')[0]
        : new Date().toISOString().split('T')[0],
      consultReason: enc?.enc_reason || null,
      consultGoal: rawFormData['consultGoal'] || null,
      status: enc?.enc_status || 'IN_PROGRESS',
      templateCode: metaSnapshot?.tpl_code || tpl?.tpl_code || 'PELVI_EVAL',
      templateName: metaSnapshot?.tpl_name || tpl?.tpl_name || 'Evaluación de Piso Pélvico',
      templateVersion: metaSnapshot?.tpl_version || tpl?.tpl_version || '1.0.0',
      practitionerName,
      signedAt: enc?.enc_signedat ? String(enc.enc_signedat) : null,
      signedBy: enc?.enc_signedby || null,
    };

    // 4. Modalidades de Tratamiento
    const treatments: ClinicalReportTreatmentItem[] = (enc?.treatments || []).map((t) => ({
      name: t.enctr_name,
      dosageParameters: t.enctr_dosageparameters,
      homePrescription: t.enctr_homeprescription || null,
      targetZone: t.enctr_targetzone || null,
    }));

    return {
      header,
      patient,
      metadata,
      formData: rawFormData,
      calculatedScores: enc?.encounter_data?.encd_calculatedscores || {},
      treatments,
      generatedAt: new Date().toISOString(),
    };
  }
}
