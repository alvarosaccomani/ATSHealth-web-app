import { Component, computed, inject, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicFieldOption, DynamicFieldSchema } from '@interfaces/dynamic-form';
import { DynamicFormService } from '@services/dynamic-form.service';

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-field.component.html',
  styleUrl: './dynamic-field.component.scss',
})
export class DynamicFieldComponent {
  readonly dynamicFormService = inject(DynamicFormService);

  readonly field = input.required<DynamicFieldSchema>();
  readonly value = model<any>();
  readonly mode = input<'edit' | 'readonly'>('edit');
  readonly contextData = input<Record<string, any>>({});

  readonly isVisible = computed(() => {
    return this.dynamicFormService.evaluateVisibility(this.field(), this.contextData());
  });

  readonly formattedValue = computed(() => {
    return this.dynamicFormService.formatFieldValue(this.field(), this.value());
  });

  readonly colSpanClass = computed(() => {
    const span = this.field().colSpan;
    switch (span) {
      case 2:
        return 'col-span-1 sm:col-span-2';
      case 3:
        return 'col-span-1 sm:col-span-2 lg:col-span-3';
      case 4:
        return 'col-span-1 sm:col-span-2 lg:col-span-4';
      default:
        return 'col-span-1';
    }
  });

  onSelectOption(opt: DynamicFieldOption): void {
    if (this.mode() === 'readonly') return;
    this.value.set(opt.value);
  }
}