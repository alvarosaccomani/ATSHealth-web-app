import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { CompanyContextService } from '@services/company-context.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly companyContext = inject(CompanyContextService);
  private readonly toast = inject(ToastService);

  readonly email = signal<string>('lic.gonzalez@atshealth.com');
  readonly password = signal<string>('PelviCloud2026!');
  readonly rememberMe = signal<boolean>(true);
  readonly showPassword = signal<boolean>(false);
  readonly isLoading = this.authService.isLoading;
  readonly errorMessage = signal<string | null>(null);

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  onEmailChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.email.set(val);
  }

  onPasswordChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.password.set(val);
  }

  onRememberChange(event: Event): void {
    const val = (event.target as HTMLInputElement).checked;
    this.rememberMe.set(val);
  }

  submitLogin(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const emailVal = this.email().trim();
    const passVal = this.password().trim();

    if (!emailVal || !passVal) {
      const msg = 'Por favor ingresá tu email profesional y contraseña.';
      this.errorMessage.set(msg);
      this.toast.warning(msg);
      return;
    }

    this.errorMessage.set(null);

    this.authService
      .login({
        usr_user: emailVal,
        usr_password: passVal,
        gettoken: true,
      })
      .subscribe({
        next: (loginRes) => {
          this.toast.success('¡Bienvenida/o a PelviCloud!');
          const userUuid = loginRes?.data?.user?.usr_uuid;

          if (userUuid) {
            // Verificar si el usuario tiene empresas asociadas antes de redirigir
            this.companyContext.loadUserCompanies(userUuid).subscribe({
              next: (companies) => {
                if (companies && companies.length > 0) {
                  this.router.navigate(['/admin/user/patients']);
                } else {
                  this.toast.info('Completá la vinculación de tu consultorio o clínica para comenzar.');
                  this.router.navigate(['/admin/user/company-onboarding']);
                }
              },
              error: () => {
                this.router.navigate(['/admin/user/company-onboarding']);
              },
            });
          } else {
            this.router.navigate(['/admin/user/patients']);
          }
        },
        error: (err) => {
          const errorMsg =
            err?.error?.message ||
            err?.error?.error ||
            err?.message ||
            'Error al iniciar sesión. Verificá tus credenciales.';
          this.errorMessage.set(errorMsg);
          this.toast.error(errorMsg);
        },
      });
  }

  loginWithDemo(): void {
    this.email.set('lic.gonzalez@atshealth.com');
    this.password.set('PelviCloud2026!');
    this.submitLogin();
  }
}
