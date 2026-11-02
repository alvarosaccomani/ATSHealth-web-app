import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ToastService } from '../../../../core/services/toast.service';

declare const Chart: any;

@Component({
  selector: 'app-stage-4-evolution',
  imports: [],
  templateUrl: './stage-4-evolution.component.html',
  styleUrl: './stage-4-evolution.component.scss',
})
export class Stage4EvolutionComponent implements AfterViewInit, OnDestroy {
  readonly prevStage = output<number>();
  readonly completeConsultation = output<void>();

  // Canvas references
  readonly radarCanvas = viewChild<ElementRef<HTMLCanvasElement>>('radarCanvas');
  readonly evolutionCanvas = viewChild<ElementRef<HTMLCanvasElement>>('evolutionCanvas');

  // Chart instances
  private perfectChart: any = null;
  private evolutionChart: any = null;

  // Estado del mensaje de confirmación
  readonly isCompleted = signal<boolean>(false);

  ngAfterViewInit(): void {
    // Delay de 50ms para asegurar que el DOM del layout esté completamente renderizado
    setTimeout(() => {
      this.initCharts();
    }, 50);
  }

  ngOnDestroy(): void {
    if (this.perfectChart) {
      this.perfectChart.destroy();
    }
    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }
  }

  private initCharts(): void {
    if (typeof Chart === 'undefined') return;

    const isDarkMode =
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark');
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const textColor = isDarkMode ? '#cbd5e1' : '#64748b';

    // 1. Radar PERFECT
    const radarElem = this.radarCanvas()?.nativeElement;
    if (radarElem) {
      const rCtx = radarElem.getContext('2d');
      if (this.perfectChart) this.perfectChart.destroy();
      this.perfectChart = new Chart(rCtx, {
        type: 'radar',
        data: {
          labels: [
            'Power (Oxford 0-5)',
            'Endurance (seg / 10)',
            'Repetitions (cant)',
            'Fast (cant / 10)',
          ],
          datasets: [
            {
              label: 'Basal (Sesión 1)',
              data: [2, 4, 3, 4],
              fill: true,
              backgroundColor: 'rgba(244, 63, 94, 0.25)',
              borderColor: '#f43f5e',
              pointBackgroundColor: '#f43f5e',
              pointBorderColor: '#fff',
              borderWidth: 2,
            },
            {
              label: 'Actual (Sesión 6)',
              data: [3.5, 7, 7, 8],
              fill: true,
              backgroundColor: 'rgba(20, 184, 166, 0.3)',
              borderColor: '#14b8a6',
              pointBackgroundColor: '#14b8a6',
              pointBorderColor: '#fff',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: gridColor },
              grid: { color: gridColor },
              pointLabels: {
                color: textColor,
                font: { size: 10, weight: '600' },
              },
              suggestedMin: 0,
              suggestedMax: 10,
              ticks: { display: false, stepSize: 2 },
            },
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: textColor,
                boxWidth: 12,
                font: { size: 11, weight: 'bold' },
              },
            },
          },
        },
      });
    }

    // 2. Línea de Evolución ICIQ-UI SF
    const evolElem = this.evolutionCanvas()?.nativeElement;
    if (evolElem) {
      const eCtx = evolElem.getContext('2d');
      if (this.evolutionChart) this.evolutionChart.destroy();
      this.evolutionChart = new Chart(eCtx, {
        type: 'line',
        data: {
          labels: ['Sesión 1 (Basal)', 'Sesión 2', 'Sesión 4', 'Sesión 6 (Actual)'],
          datasets: [
            {
              label: 'Puntaje ICIQ-UI SF (0-21)',
              data: [16, 12, 7, 4],
              borderColor: '#0d9488',
              backgroundColor: 'rgba(13, 148, 136, 0.15)',
              tension: 0.35,
              fill: true,
              borderWidth: 2.5,
              pointBackgroundColor: '#0d9488',
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 0,
              max: 21,
              grid: { color: gridColor },
              ticks: { color: textColor, stepSize: 5 },
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 10 } },
            },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
    }
  }

  goToPrev(): void {
    this.prevStage.emit(3);
  }

  private readonly toast = inject(ToastService);

  finishConsultation(): void {
    this.isCompleted.set(true);
    this.toast.success('Consulta clínica cerrada y firmada digitalmente');
    this.completeConsultation.emit();
  }
}
