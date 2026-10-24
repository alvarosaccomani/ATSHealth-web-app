import { Component, OnInit, signal, output } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit {
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
  }

  private initTheme(): void {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('pelvicloud_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
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
    }, 600);
    this.onSave.emit();
  }
}
