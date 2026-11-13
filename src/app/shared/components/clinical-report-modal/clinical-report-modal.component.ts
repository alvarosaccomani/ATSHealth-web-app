import { Component, HostListener, OnDestroy, computed, effect, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ClinicalReportService } from '@services/clinical-report.service';
import { TemplatesService } from '@services/templates.service';
import { DynamicFormComponent } from '@components/dynamic-form';
import { DynamicTemplateSchema } from '@interfaces/dynamic-form';

@Component({
  selector: 'app-clinical-report-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, DynamicFormComponent],
  templateUrl: './clinical-report-modal.component.html',
  styleUrl: './clinical-report-modal.component.scss',
})
export class ClinicalReportModalComponent implements OnDestroy {
  readonly reportService = inject(ClinicalReportService);
  readonly templatesService = inject(TemplatesService);

  readonly isOpen = this.reportService.isReportModalOpen;
  readonly report = this.reportService.activeReportData;

  readonly activeTemplateSchema = computed<DynamicTemplateSchema | null>(() => {
    const schema = this.templatesService.activeTemplate()?.tpl_schema as any;
    return schema?.stages ? schema : null;
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('report-modal-open', open);
      }
    });
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('report-modal-open');
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  close(): void {
    this.reportService.closeReport();
  }

  print(): void {
    this.reportService.printReport();
  }
}
