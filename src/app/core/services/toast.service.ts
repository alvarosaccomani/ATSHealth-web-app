import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  isClosing: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(message: string, type: ToastType = 'success', duration = 3200): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { id, message, type, isClosing: false };

    this.toasts.update((current) => [...current, newToast]);

    // Disparar animación de salida antes de remover
    setTimeout(() => {
      this.startClosing(id);
    }, Math.max(0, duration - 300));
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: string): void {
    this.startClosing(id);
  }

  private startClosing(id: string): void {
    const existing = this.toasts().find((t) => t.id === id);
    if (!existing || existing.isClosing) return;

    this.toasts.update((current) =>
      current.map((t) => (t.id === id ? { ...t, isClosing: true } : t))
    );

    setTimeout(() => {
      this.toasts.update((current) => current.filter((t) => t.id !== id));
    }, 280);
  }
}
