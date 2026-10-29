import { Component, OnInit, inject, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit {
  private readonly toast = inject(ToastService);

  protected readonly isDarkMode = signal<boolean>(false);
  protected readonly autosaveStatus = signal<string>('Autoguardado activo');

  readonly onSave = output<void>();
  readonly onPrint = output<void>();

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

  protected printRecord(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
    this.onPrint.emit();
  }

  protected saveRecord(): void {
    this.autosaveStatus.set('Guardando...');
    setTimeout(() => {
      this.autosaveStatus.set('Guardado recién');
      this.toast.success('Consulta clínica y prescripción guardadas');
    }, 500);
    this.onSave.emit();
  }
}
