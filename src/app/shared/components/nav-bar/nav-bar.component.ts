import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '@services/sidebar.service';
import { CompanyContextService } from '@services/company-context.service';
import { ToastService } from '@services/toast.service';
import { CompanyEntity } from '@interfaces/company';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit {
  private readonly toast = inject(ToastService);
  readonly sidebarService = inject(SidebarService);
  readonly companyContext = inject(CompanyContextService);

  protected readonly isDarkMode = signal<boolean>(false);
  protected readonly isCompanyDropdownOpen = signal<boolean>(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.company-dropdown-container')) {
      this.isCompanyDropdownOpen.set(false);
    }
  }

  toggleCompanyDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isCompanyDropdownOpen.update((open) => !open);
  }

  selectCompany(company: CompanyEntity): void {
    this.companyContext.setActiveCompany(company);
    this.isCompanyDropdownOpen.set(false);
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
