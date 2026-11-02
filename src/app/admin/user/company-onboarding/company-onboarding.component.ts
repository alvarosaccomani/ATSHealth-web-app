import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyService } from '@services/company.service';
import { UserRolesCompanyService } from '@services/user-roles-company.service';
import { AuthService } from '@services/auth.service';
import { CompanyContextService } from '@services/company-context.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-company-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-onboarding.component.html',
  styleUrl: './company-onboarding.component.scss',
})
export class CompanyOnboardingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly companyService = inject(CompanyService);
  private readonly userRolesCompanyService = inject(UserRolesCompanyService);
  private readonly authService = inject(AuthService);
  private readonly companyContext = inject(CompanyContextService);
  private readonly toast = inject(ToastService);

  readonly mode = signal<'create' | 'join'>('create');
  readonly isSubmitting = signal<boolean>(false);

  createForm: FormGroup = this.fb.group({
    cmp_name: ['', [Validators.required, Validators.maxLength(150)]],
    cmp_address: [''],
    cmp_phone: [''],
    cmp_email: ['', [Validators.email]],
    cmp_description: [''],
  });

  joinForm: FormGroup = this.fb.group({
    cmp_uuid: ['', [Validators.required, Validators.minLength(10)]],
  });

  setMode(selected: 'create' | 'join'): void {
    this.mode.set(selected);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.toast.warning('Por favor completá los datos requeridos de tu clínica.');
      return;
    }

    const usrUuid = this.authService.currentUser()?.usr_uuid;
    if (!usrUuid) {
      this.toast.error('Sesión no encontrada. Por favor iniciá sesión nuevamente.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.createForm.value;

    const companyPayload = {
      cmp_name: formVal.cmp_name.trim(),
      cmp_address: formVal.cmp_address?.trim() || null,
      cmp_phone: formVal.cmp_phone?.trim() || null,
      cmp_email: formVal.cmp_email?.trim() || null,
      cmp_description: formVal.cmp_description?.trim() || null,
      cmp_status: 'active',
    };

    this.companyService.createCompany(companyPayload).subscribe({
      next: (res) => {
        const created = res.data;
        if (!created || !created.cmp_uuid) {
          this.isSubmitting.set(false);
          this.toast.error('No se recibió la confirmación de la empresa.');
          return;
        }

        // Vincular el usuario creador como titular/responsable con rol admin
        const ADMIN_ROL_UUID = '1e1eda23-9c30-4bca-8785-d802ad96c1c3';
        const linkPayload = {
          cmp_uuid: created.cmp_uuid,
          usr_uuid: usrUuid,
          rol_uuid: ADMIN_ROL_UUID,
        };

        this.userRolesCompanyService.saveUserRolCompany(linkPayload).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toast.success(`¡Clínica "${created.cmp_name}" registrada con éxito!`);
            this.companyContext.setActiveCompany(created);
            this.companyContext.loadUserCompanies(usrUuid);
            this.router.navigate(['/admin/user/patients']);
          },
          error: (err) => {
            this.isSubmitting.set(false);
            // Si la empresa se creó pero falló el link, al menos la activamos
            this.companyContext.setActiveCompany(created);
            this.router.navigate(['/admin/user/patients']);
          },
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          err?.message ||
          'Error al registrar la empresa.';
        this.toast.error(msg);
      },
    });
  }

  submitJoin(): void {
    if (this.joinForm.invalid) {
      this.joinForm.markAllAsTouched();
      this.toast.warning('Ingresá un identificador o código de clínica válido.');
      return;
    }

    const usrUuid = this.authService.currentUser()?.usr_uuid;
    if (!usrUuid) {
      this.toast.error('Sesión no encontrada.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isSubmitting.set(true);
    const targetCmpUuid = this.joinForm.value.cmp_uuid.trim();

    // Consultar existencia de la clínica
    this.companyService.getCompanyById(targetCmpUuid).subscribe({
      next: (res) => {
        const company = res.data;
        const ADMIN_ROL_UUID = '1e1eda23-9c30-4bca-8785-d802ad96c1c3';
        const linkPayload = {
          cmp_uuid: targetCmpUuid,
          usr_uuid: usrUuid,
          rol_uuid: ADMIN_ROL_UUID,
        };

        this.userRolesCompanyService.saveUserRolCompany(linkPayload).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toast.success(`Te has vinculado a "${company.cmp_name || 'la clínica'}".`);
            this.companyContext.setActiveCompany(company);
            this.companyContext.loadUserCompanies(usrUuid);
            this.router.navigate(['/admin/user/patients']);
          },
          error: (err) => {
            this.isSubmitting.set(false);
            const msg =
              err?.error?.message ||
              err?.error?.error ||
              'No se pudo vincular a la clínica.';
            this.toast.error(msg);
          },
        });
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toast.error('No se encontró ninguna clínica con el código provisto.');
      },
    });
  }
}
