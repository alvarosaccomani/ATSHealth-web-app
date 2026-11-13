import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent implements OnInit {
  protected readonly isDarkMode = signal<boolean>(false);

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('pelvicloud_theme');
    const prefersDark =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    this.isDarkMode.set(isDark);
  }

  protected toggleTheme(): void {
    const nextMode = !this.isDarkMode();
    this.isDarkMode.set(nextMode);
    if (typeof document !== 'undefined') {
      if (nextMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('pelvicloud_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('pelvicloud_theme', 'light');
      }
    }
  }
}
