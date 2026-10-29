import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  /**
   * @description Estado colapsado del sidebar (solo iconos en desktop).
   */
  readonly isCollapsed = signal<boolean>(false);

  /**
   * @description Estado abierto del sidebar en pantallas móviles (drawer / modal).
   */
  readonly isMobileOpen = signal<boolean>(false);

  constructor() {
    this.restoreState();
  }

  /**
   * @description Alterna el estado colapsado del sidebar en escritorio.
   */
  toggleCollapse(): void {
    const next = !this.isCollapsed();
    this.isCollapsed.set(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sidebar_collapsed', String(next));
    }
  }

  /**
   * @description Alterna la visibilidad del drawer móvil.
   */
  toggleMobile(): void {
    this.isMobileOpen.update((open) => !open);
  }

  /**
   * @description Cierra el drawer móvil explícitamente (ej. tras hacer clic en un link).
   */
  closeMobile(): void {
    this.isMobileOpen.set(false);
  }

  private restoreState(): void {
    if (typeof localStorage === 'undefined') return;
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) {
      this.isCollapsed.set(saved === 'true');
    }
  }
}