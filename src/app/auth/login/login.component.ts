import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly router = inject(Router);

  readonly email = signal<string>('lic.gonzalez@atshealth.com');
  readonly password = signal<string>('PelviCloud2026!');
  readonly rememberMe = signal<boolean>(true);
  readonly showPassword = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
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
      this.errorMessage.set('Por favor ingresá tu email profesional y contraseña.');
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    // Simulación de autenticación profesional (token / sesión)
    setTimeout(() => {
      this.isLoading.set(false);
      this.router.navigate(['/admin/application']);
    }, 700);
  }

  loginWithDemo(): void {
    this.email.set('lic.gonzalez@atshealth.com');
    this.password.set('PelviCloud2026!');
    this.submitLogin();
  }
}
