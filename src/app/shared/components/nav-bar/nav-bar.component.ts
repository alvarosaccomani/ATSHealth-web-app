import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SidebarService } from '@services/sidebar.service';
import { CompanyContextService } from '@services/company-context.service';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { CompanyEntity } from '@interfaces/company';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly sidebarService = inject(SidebarService);
  readonly companyContext = inject(CompanyContextService);
  readonly authService = inject(AuthService);

  protected readonly isDarkMode = signal<boolean>(false);
  protected readonly isCompanyDropdownOpen = signal<boolean>(false);
  protected readonly isUserDropdownOpen = signal<boolean>(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.company-dropdown-container')) {
      this.isCompanyDropdownOpen.set(false);
    }
    if (!target.closest('.user-dropdown-container')) {
      this.isUserDropdownOpen.set(false);
    }
  }

  toggleCompanyDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserDropdownOpen.set(false);
    this.isCompanyDropdownOpen.update((open) => !open);
  }

  toggleUserDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isCompanyDropdownOpen.set(false);
    this.isUserDropdownOpen.update((open) => !open);
  }

  selectCompany(company: CompanyEntity): void {
    this.companyContext.setActiveCompany(company);
    this.isCompanyDropdownOpen.set(false);
  }

  logout(): void {
    this.isUserDropdownOpen.set(false);
    this.authService.logout();
    this.toast.info('Sesión finalizada correctamente.');
    this.router.navigate(['/auth/login']);
  }

  ngOnInit(): void {
    this.initTheme();
  }

  protected toggleTheme(): void {
    const nextMode = !this.isDarkMode();
    this.isDarkMode.set(nextMode);
    this.applyTheme(nextMode);
    this.toast.info(nextMode ? 'Modo Nocturno activado' : 'Modo Diurno activado');
  }

  private initTheme(): void {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('pelvicloud_theme');
    const prefersDark =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    this.isDarkMode.set(isDark);
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document === 'undefined') return;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pelvicloud_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pelvicloud_theme', 'light');
    }
  }
}
