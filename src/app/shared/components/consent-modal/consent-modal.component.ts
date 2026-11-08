import { Component, HostListener, input, model, output } from '@angular/core';

@Component({
  selector: 'app-consent-modal',
  imports: [],
  templateUrl: './consent-modal.component.html',
  styleUrl: './consent-modal.component.scss',
})
export class ConsentModalComponent {
  readonly isOpen = model<boolean>(false);
  readonly patientName = input<string>('Mariana González Rivas');
  readonly dni = input<string>('35.892.110');
  readonly closed = output<void>();

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  printPlantilla(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
