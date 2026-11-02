import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CompanyContextService } from '@services/company-context.service';
import { CompanyService } from '@services/company.service';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { CompanyEntity } from '@interfaces/company';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './company-profile.component.html',
  styleUrl: './company-profile.component.scss',
})
export class CompanyProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly companyContext = inject(CompanyContextService);
  private readonly companyService = inject(CompanyService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly isSubmitting = signal<boolean>(false);
  readonly logoPreview = signal<string | null>(null);
  readonly bannerPreview = signal<string | null>(null);

  profileForm: FormGroup = this.fb.group({
    cmp_name: ['', [Validators.required, Validators.maxLength(150)]],
    cmp_description: [''],
    cmp_phone: [''],
    cmp_email: ['', [Validators.email]],
    cmp_address: [''],
    cmp_whatsapp: [''],
    cmp_instagram: [''],
    cmp_facebook: [''],
    cmp_primarycolor: ['#0d9488'],
    cmp_logo: [''],
    cmp_banner: [''],
  });

  ngOnInit(): void {
    this.populateForm();
  }

  populateForm(): void {
    const active = this.companyContext.activeCompany();
    if (!active) return;

    this.profileForm.patchValue({
      cmp_name: active.cmp_name || '',
      cmp_description: active.cmp_description || '',
      cmp_phone: active.cmp_phone || '',
      cmp_email: active.cmp_email || '',
      cmp_address: active.cmp_address || '',
      cmp_whatsapp: active.cmp_whatsapp || '',
      cmp_instagram: active.cmp_instagram || '',
      cmp_facebook: active.cmp_facebook || '',
      cmp_primarycolor: active.cmp_primarycolor || '#0d9488',
      cmp_logo: active.cmp_logo || '',
      cmp_banner: active.cmp_banner || '',
    });

    if (active.cmp_logo) {
      this.logoPreview.set(active.cmp_logo);
    }
    if (active.cmp_banner) {
      this.bannerPreview.set(active.cmp_banner);
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        this.toast.warning('El logo no debe superar los 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.logoPreview.set(base64);
        this.profileForm.patchValue({ cmp_logo: base64 });
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoPreview.set(null);
    this.profileForm.patchValue({ cmp_logo: null });
  }

  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 4 * 1024 * 1024) {
        this.toast.warning('El banner no debe superar los 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.bannerPreview.set(base64);
        this.profileForm.patchValue({ cmp_banner: base64 });
      };
      reader.readAsDataURL(file);
    }
  }

  removeBanner(): void {
    this.bannerPreview.set(null);
    this.profileForm.patchValue({ cmp_banner: null });
  }

  submitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toast.warning('Por favor revisá los campos del formulario.');
      return;
    }

    const active = this.companyContext.activeCompany();
    if (!active?.cmp_uuid) {
      this.toast.error('No hay una clínica activa seleccionada.');
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.profileForm.value;

    const payload: Partial<CompanyEntity> = {
      cmp_name: formVal.cmp_name.trim(),
      cmp_description: formVal.cmp_description?.trim() || null,
      cmp_phone: formVal.cmp_phone?.trim() || null,
      cmp_email: formVal.cmp_email?.trim() || null,
      cmp_address: formVal.cmp_address?.trim() || null,
      cmp_whatsapp: formVal.cmp_whatsapp?.trim() || null,
      cmp_instagram: formVal.cmp_instagram?.trim() || null,
      cmp_facebook: formVal.cmp_facebook?.trim() || null,
      cmp_primarycolor: formVal.cmp_primarycolor || '#0d9488',
      cmp_logo: formVal.cmp_logo || null,
      cmp_banner: formVal.cmp_banner || null,
      cmp_status: active.cmp_status || 'active',
    };

    this.companyService.updateCompany(active.cmp_uuid, payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        const updated = res.data;
        this.toast.success('¡Datos y branding de la clínica actualizados con éxito!');

        if (updated) {
          this.companyContext.setActiveCompany(updated, false);
          const userUuid = this.authService.currentUser()?.usr_uuid;
          if (userUuid) {
            this.companyContext.loadUserCompanies(userUuid);
          }
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          'Error al actualizar los datos de la clínica.';
        this.toast.error(msg);
      },
    });
  }
}
