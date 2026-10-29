import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientsService } from '@services/patients.service';
import { ToastService } from '@services/toast.service';
import { PatientInterface } from '@interfaces/patient';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.scss',
})
export class PatientComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientsService = inject(PatientsService);
  private readonly toast = inject(ToastService);

  readonly isEditMode = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly patUuid = signal<string | null>(null);

  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    const paramUuid = this.route.snapshot.paramMap.get('pat_uuid');
    if (paramUuid && paramUuid.trim() !== '') {
      this.patUuid.set(paramUuid);
      this.isEditMode.set(true);
      this.loadPatientData(paramUuid);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      pat_firstname: ['', [Validators.required, Validators.maxLength(100)]],
      pat_lastname: ['', [Validators.required, Validators.maxLength(100)]],
      pat_documentnumber: ['', [Validators.required, Validators.maxLength(30)]],
      pat_birthdate: ['', [Validators.required]],
      pat_biologicalsex: ['femenino', [Validators.required]],
      pat_genderidentity: [''],
      pat_occupation: [''],
      pat_phone: [''],
      pat_email: ['', [Validators.email]],
      pat_medicalcoverage: [''],
      pat_affiliatenumber: [''],
      pat_emergencycontact: [''],
      pat_active: [true],
    });
  }

  private loadPatientData(uuid: string): void {
    this.isLoading.set(true);
    this.patientsService.getPatientById(uuid).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const data = res?.data;
        if (data) {
          let formattedDate = '';
          if (data.pat_birthdate) {
            const raw = String(data.pat_birthdate);
            formattedDate = raw.includes('T') ? raw.split('T')[0] : raw;
          }

          this.form.patchValue({
            pat_firstname: data.pat_firstname ?? '',
            pat_lastname: data.pat_lastname ?? '',
            pat_documentnumber: data.pat_documentnumber ?? '',
            pat_birthdate: formattedDate,
            pat_biologicalsex: data.pat_biologicalsex ?? 'femenino',
            pat_genderidentity: data.pat_genderidentity ?? '',
            pat_occupation: data.pat_occupation ?? '',
            pat_phone: data.pat_phone ?? '',
            pat_email: data.pat_email ?? '',
            pat_medicalcoverage: data.pat_medicalcoverage ?? '',
            pat_affiliatenumber: data.pat_affiliatenumber ?? '',
            pat_emergencycontact: data.pat_emergencycontact ?? '',
            pat_active: data.pat_active ?? true,
          });
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMsg =
          err?.error?.message ||
          err?.message ||
          'No se pudo cargar la información del paciente.';
        this.toast.error(errorMsg);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Por favor revisá los campos obligatorios del formulario.');
      return;
    }

    const formValue = this.form.value;
    // TODO: Pendiente obtener cmp_uuid de forma dinámica según el contexto de la empresa o sesión activa.
    const DEFAULT_CMP_UUID = 'a6873776-0d8e-45a9-8e2e-61e07f7ed245';

    const payload: Partial<PatientInterface> = {
      cmp_uuid: DEFAULT_CMP_UUID,
      pat_firstname: formValue.pat_firstname.trim(),
      pat_lastname: formValue.pat_lastname.trim(),
      pat_documentnumber: formValue.pat_documentnumber.trim(),
      pat_birthdate: formValue.pat_birthdate,
      pat_biologicalsex: formValue.pat_biologicalsex,
      pat_genderidentity: formValue.pat_genderidentity?.trim() || null,
      pat_occupation: formValue.pat_occupation?.trim() || null,
      pat_phone: formValue.pat_phone?.trim() || null,
      pat_email: formValue.pat_email?.trim() || null,
      pat_medicalcoverage: formValue.pat_medicalcoverage?.trim() || null,
      pat_affiliatenumber: formValue.pat_affiliatenumber?.trim() || null,
      pat_emergencycontact: formValue.pat_emergencycontact?.trim() || null,
      pat_active: Boolean(formValue.pat_active),
    };

    this.isSaving.set(true);

    if (this.isEditMode() && this.patUuid()) {
      this.patientsService.updatePatient(this.patUuid()!, payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toast.success('Paciente actualizado con éxito.');
          this.router.navigate(['/admin/application/patients']);
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg =
            err?.error?.message ||
            err?.message ||
            'Error al actualizar el paciente.';
          this.toast.error(errorMsg);
        },
      });
    } else {
      this.patientsService.createPatient(payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toast.success('Paciente registrado con éxito.');
          this.router.navigate(['/admin/application/patients']);
        },
        error: (err) => {
          this.isSaving.set(false);
          const errorMsg =
            err?.error?.message ||
            err?.message ||
            'Error al crear el paciente.';
          this.toast.error(errorMsg);
        },
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return Boolean(control && control.invalid && (control.dirty || control.touched));
  }
}
