import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TemplatesService } from '@services/templates.service';
import { CompanyItemsService } from '@services/company-items.service';
import { CompanyContextService } from '@services/company-context.service';
import { ToastService } from '@services/toast.service';
import { TemplateCreateInput, TemplateInterface, TemplateUpdateInput } from '@interfaces/template';
import { CompanyItemInterface } from '@interfaces/company-item';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss',
})
export class TemplatesComponent implements OnInit {
  readonly templatesService = inject(TemplatesService);
  readonly companyItemsService = inject(CompanyItemsService);
  readonly companyContext = inject(CompanyContextService);
  private readonly toast = inject(ToastService);

  readonly templates = this.templatesService.templates;
  readonly isLoading = this.templatesService.isLoading;
  readonly isSaving = this.templatesService.isSaving;

  readonly companyItems = this.companyItemsService.companyItems;
  readonly isLoadingItems = this.companyItemsService.isLoading;

  // Studio Drawer State
  readonly isStudioOpen = signal<boolean>(false);
  readonly editingTemplate = signal<TemplateInterface | null>(null);
  readonly activeTab = signal<'editor' | 'preview'>('editor');

  // Form Fields
  readonly tplName = signal<string>('');
  readonly tplCode = signal<string>('');
  readonly tplVersion = signal<string>('1.0.0');
  readonly tplIsActive = signal<boolean>(true);
  readonly selectedCmpItmUuid = signal<string>('');
  readonly schemaJsonText = signal<string>('');
  readonly jsonError = signal<string | null>(null);

  // Computed Inspector & Selection
  readonly selectedCompanyItem = computed(() => {
    const list = this.companyItems();
    const id = this.selectedCmpItmUuid();
    return list.find((ci) => ci.cmpitm_uuid === id) || null;
  });

  readonly parsedSchema = computed(() => {
    try {
      return JSON.parse(this.schemaJsonText());
    } catch {
      return null;
    }
  });

  readonly stagesCount = computed(() => {
    const s = this.parsedSchema();
    return s?.stages && Array.isArray(s.stages) ? s.stages.length : 0;
  });

  readonly sectionsCount = computed(() => {
    const s = this.parsedSchema();
    if (!s?.stages || !Array.isArray(s.stages)) return 0;
    return s.stages.reduce((acc: number, st: any) => acc + (st.sections?.length || 0), 0);
  });

  constructor() {
    effect(() => {
      const activeCmp = this.companyContext.activeCompany();
      if (activeCmp?.cmp_uuid) {
        this.reload(activeCmp.cmp_uuid);
      }
    });
  }

  ngOnInit(): void {
    // La carga inicial y ante cambios de empresa activa se orquesta reactivamente en el constructor con effect()
  }

  reload(cmp_uuid?: string): void {
    const target = cmp_uuid || this.companyContext.activeCompany()?.cmp_uuid;
    if (target) {
      this.templatesService.getTemplates(target).subscribe();
      this.companyItemsService.getCompanyItems(target).subscribe({
        next: (res) => {
          const list = res?.data || [];
          if (!this.selectedCmpItmUuid() && list.length > 0) {
            this.selectedCmpItmUuid.set(list[0].cmpitm_uuid);
          }
        },
      });
    }
  }

  openNewStudio(presetKey: string = 'piso_pelvico'): void {
    const preset = this.templatesService.getPresetSchema(presetKey);
    this.editingTemplate.set(null);
    this.tplName.set(preset.name);
    this.tplCode.set(preset.code);
    this.tplVersion.set(preset.version);
    this.tplIsActive.set(true);

    if (!this.selectedCmpItmUuid() && this.companyItems().length > 0) {
      this.selectedCmpItmUuid.set(this.companyItems()[0].cmpitm_uuid);
    }

    this.schemaJsonText.set(JSON.stringify(preset.schema, null, 2));
    this.jsonError.set(null);
    this.activeTab.set('editor');
    this.isStudioOpen.set(true);
  }

  openEditStudio(tpl: TemplateInterface): void {
    this.editingTemplate.set(tpl);
    this.tplName.set(tpl.tpl_name);
    this.tplCode.set(tpl.tpl_code);
    this.tplVersion.set(tpl.tpl_version || '1.0.0');
    this.tplIsActive.set(tpl.tpl_isactive);

    if (tpl.cmpitm_uuid) {
      this.selectedCmpItmUuid.set(tpl.cmpitm_uuid);
    } else if (this.companyItems().length > 0) {
      this.selectedCmpItmUuid.set(this.companyItems()[0].cmpitm_uuid);
    }

    this.schemaJsonText.set(JSON.stringify(tpl.tpl_schema || {}, null, 2));
    this.jsonError.set(null);
    this.activeTab.set('editor');
    this.isStudioOpen.set(true);
  }

  closeStudio(): void {
    this.isStudioOpen.set(false);
    this.editingTemplate.set(null);
    this.jsonError.set(null);
  }

  loadPreset(presetKey: string): void {
    const preset = this.templatesService.getPresetSchema(presetKey);
    this.tplName.set(preset.name);
    this.tplCode.set(preset.code);
    this.tplVersion.set(preset.version);
    this.schemaJsonText.set(JSON.stringify(preset.schema, null, 2));
    this.jsonError.set(null);
    this.toast.info(`Cargado esquema base: ${preset.name}`);
  }

  formatJson(): void {
    try {
      const parsed = JSON.parse(this.schemaJsonText());
      this.schemaJsonText.set(JSON.stringify(parsed, null, 2));
      this.jsonError.set(null);
      this.toast.success('JSON formateado correctamente.');
    } catch (e: any) {
      this.jsonError.set(`JSON no válido: ${e.message}`);
    }
  }

  onJsonInput(text: string): void {
    this.schemaJsonText.set(text);
    try {
      JSON.parse(text);
      this.jsonError.set(null);
    } catch (e: any) {
      this.jsonError.set(`Error de sintaxis: ${e.message}`);
    }
  }

  getItemName(cmpitm_uuid?: string, itm_uuid?: string): string {
    const found = this.companyItems().find(
      (ci) => ci.cmpitm_uuid === cmpitm_uuid || ci.itm_uuid === itm_uuid
    );
    return found?.itm?.itm_name || 'Especialidad';
  }

  saveTemplate(): void {
    const activeCmp = this.companyContext.activeCompany();
    if (!activeCmp?.cmp_uuid) {
      this.toast.error('No hay una clínica seleccionada.');
      return;
    }

    if (!this.selectedCmpItmUuid()) {
      this.toast.warning('Debes seleccionar el servicio médico (Company Item) para la plantilla.');
      return;
    }

    const item = this.selectedCompanyItem();
    if (!item) {
      this.toast.error('El servicio médico seleccionado no es válido para esta clínica.');
      return;
    }

    if (!this.tplName().trim()) {
      this.toast.warning('El nombre de la plantilla es requerido.');
      return;
    }

    if (!this.tplCode().trim()) {
      this.toast.warning('El código nemotécnico es requerido.');
      return;
    }

    let parsedSchema: Record<string, any>;
    try {
      parsedSchema = JSON.parse(this.schemaJsonText());
    } catch (e: any) {
      this.jsonError.set(`No se puede guardar: el JSON contiene errores (${e.message})`);
      this.toast.error('Corrige los errores de sintaxis en el JSON antes de guardar.');
      return;
    }

    const currentEditing = this.editingTemplate();

    if (currentEditing) {
      // MODO EDICIÓN
      const updatePayload: TemplateUpdateInput = {
        tpl_name: this.tplName().trim(),
        tpl_code: this.tplCode().trim().toUpperCase(),
        tpl_version: this.tplVersion().trim(),
        tpl_schema: parsedSchema,
        tpl_isactive: this.tplIsActive(),
      };

      this.templatesService
        .updateTemplate(currentEditing.tpl_uuid, activeCmp.cmp_uuid, updatePayload)
        .subscribe({
          next: () => {
            this.toast.success(`Plantilla "${this.tplName()}" actualizada con éxito.`);
            this.closeStudio();
          },
          error: (err) => {
            const msg = err?.error?.message || err?.message || 'Error al actualizar la plantilla.';
            this.toast.error(msg);
          },
        });
    } else {
      // MODO CREACIÓN
      const createPayload: TemplateCreateInput = {
        cmp_uuid: activeCmp.cmp_uuid,
        itm_uuid: item.itm_uuid,
        cmpitm_uuid: item.cmpitm_uuid,
        tpl_name: this.tplName().trim(),
        tpl_code: this.tplCode().trim().toUpperCase(),
        tpl_version: this.tplVersion().trim(),
        tpl_schema: parsedSchema,
        tpl_isactive: this.tplIsActive(),
      };

      this.templatesService.createTemplate(createPayload).subscribe({
        next: () => {
          this.toast.success(`Plantilla "${this.tplName()}" creada exitosamente.`);
          this.closeStudio();
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Error al crear la plantilla clínica.';
          this.toast.error(msg);
        },
      });
    }
  }

  toggleActive(tpl: TemplateInterface, event: Event): void {
    event.stopPropagation();
    const activeCmp = this.companyContext.activeCompany();
    if (!activeCmp?.cmp_uuid) return;

    const newStatus = !tpl.tpl_isactive;
    this.templatesService
      .updateTemplate(tpl.tpl_uuid, activeCmp.cmp_uuid, { tpl_isactive: newStatus })
      .subscribe({
        next: () => {
          this.toast.info(`Plantilla "${tpl.tpl_name}" marcada como ${newStatus ? 'Activa' : 'Inactiva'}.`);
        },
        error: () => {
          this.toast.error('No se pudo modificar el estado de la plantilla.');
        },
      });
  }

  deleteTemplate(tpl: TemplateInterface, event: Event): void {
    event.stopPropagation();
    const activeCmp = this.companyContext.activeCompany();
    if (!activeCmp?.cmp_uuid) return;

    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la plantilla "${tpl.tpl_name}" (${tpl.tpl_code})? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    this.templatesService.deleteTemplate(tpl.tpl_uuid, activeCmp.cmp_uuid).subscribe({
      next: () => {
        this.toast.success(`Plantilla "${tpl.tpl_name}" eliminada.`);
      },
      error: () => {
        this.toast.error('No se pudo eliminar la plantilla.');
      },
    });
  }
}
