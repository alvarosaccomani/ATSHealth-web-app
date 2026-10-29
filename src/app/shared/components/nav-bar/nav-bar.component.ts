import { Component, OnInit, inject, signal } from '@angular/core';
import { SidebarService } from '@services/sidebar.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit {
  private readonly toast = inject(ToastService);
  readonly sidebarService = inject(SidebarService);

  protected readonly isDarkMode = signal<boolean>(false);

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
