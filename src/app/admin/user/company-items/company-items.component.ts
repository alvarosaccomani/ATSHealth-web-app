import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CompanyContextService } from '@services/company-context.service';
import { CompanyItemsService } from '@services/company-items.service';
import { ItemsService } from '@services/items.service';
import { ToastService } from '@services/toast.service';
import { CompanyItemInterface } from '@interfaces/company-item';
import { ItemInterface } from '@interfaces/item';

@Component({
  selector: 'app-company-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './company-items.component.html',
  styleUrl: './company-items.component.scss',
})
export class CompanyItemsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly companyContext = inject(CompanyContextService);
  readonly companyItemsService = inject(CompanyItemsService);
  private readonly itemsService = inject(ItemsService);
  private readonly toast = inject(ToastService);

  // Lista de asignaciones activas
  readonly companyItems = this.companyItemsService.companyItems;
  readonly isLoading = this.companyItemsService.isLoading;
  readonly isSaving = this.companyItemsService.isSaving;

  // Estados del modal de vinculación
  readonly isModalOpen = signal<boolean>(false);
  readonly filterQuery = signal<string>('');

  // Búsqueda en catálogo maestro de items
  readonly searchResults = signal<ItemInterface[]>([]);
  readonly selectedMasterItem = signal<ItemInterface | null>(null);
  readonly isSearching = signal<boolean>(false);
  readonly hasSearched = signal<boolean>(false);

  // Formulario de asignación
  assignForm: FormGroup = this.fb.group({
    search_query: [''],
    itm_uuid: ['', [Validators.required]],
  });

  // Lista filtrada de asignaciones en la tabla principal
  readonly filteredItems = computed(() => {
    const query = this.filterQuery().trim().toLowerCase();
    const items = this.companyItems();
    if (!query) return items;
    return items.filter((ci) => {
      const name = (ci.itm?.itm_name || '').toLowerCase();
      const desc = (ci.itm?.itm_description || '').toLowerCase();
      return name.includes(query) || desc.includes(query);
    });
  });

  ngOnInit(): void {
    this.loadCompanyItems();
    this.setupCatalogSearchWatcher();
  }

  loadCompanyItems(): void {
    const activeCmp = this.companyContext.activeCompany();
    if (!activeCmp?.cmp_uuid) return;
    this.companyItemsService.getCompanyItems(activeCmp.cmp_uuid).subscribe();
  }

  private setupCatalogSearchWatcher(): void {
    this.assignForm
      .get('search_query')
      ?.valueChanges.pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((query: string) => {
        const term = query?.trim();
        if (!term || term.length < 2) {
          this.searchResults.set([]);
          this.hasSearched.set(false);
          this.isSearching.set(false);
          return;
        }

        if (this.selectedMasterItem()) {
          return;
        }

        this.isSearching.set(true);
        this.itemsService.getItems(term, 1, 30).subscribe({
          next: (res) => {
            this.isSearching.set(false);
            this.hasSearched.set(true);
            const rawList: ItemInterface[] =
              res?.data && Array.isArray(res.data)
                ? res.data
                : Array.isArray(res)
                ? res
                : [];

            // Excluir los ítems que ya están asignados a la clínica activa
            const assignedUuids = new Set(this.companyItems().map((ci) => ci.itm_uuid));
            const available = rawList.filter((item) => !assignedUuids.has(item.itm_uuid));
            this.searchResults.set(available);
          },
          error: () => {
            this.isSearching.set(false);
            this.hasSearched.set(true);
            this.searchResults.set([]);
          },
        });
      });
  }

  openAssignModal(): void {
    this.selectedMasterItem.set(null);
    this.searchResults.set([]);
    this.hasSearched.set(false);
    this.assignForm.reset({
      search_query: '',
      itm_uuid: '',
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    if (this.isSaving()) return;
    this.isModalOpen.set(false);
    this.selectedMasterItem.set(null);
    this.searchResults.set([]);
    this.hasSearched.set(false);
    this.assignForm.reset();
  }

  selectItemFromCatalog(item: ItemInterface): void {
    this.selectedMasterItem.set(item);
    this.assignForm.patchValue({
      itm_uuid: item.itm_uuid,
      search_query: item.itm_name,
    });
    this.searchResults.set([]);
  }

  clearSelection(): void {
    this.selectedMasterItem.set(null);
    this.assignForm.patchValue({
      itm_uuid: '',
      search_query: '',
    });
    this.searchResults.set([]);
    this.hasSearched.set(false);
  }

  submitAssignment(): void {
    if (this.assignForm.invalid || this.isSaving()) {
      this.assignForm.markAllAsTouched();
      return;
    }

    const activeCmp = this.companyContext.activeCompany();
    if (!activeCmp?.cmp_uuid) {
      this.toast.error('No hay una clínica activa seleccionada.');
      return;
    }

    const itm_uuid = this.assignForm.get('itm_uuid')?.value;
    if (!itm_uuid) {
      this.toast.warning('Por favor seleccioná un ítem del catálogo.');
      return;
    }

    this.companyItemsService
      .assignCompanyItem({
        cmp_uuid: activeCmp.cmp_uuid,
        itm_uuid: itm_uuid,
      })
      .subscribe({
        next: () => {
          this.toast.success('Servicio médico vinculado con éxito a la clínica.');
          this.closeModal();
          this.loadCompanyItems(); // Refrescar para asegurar el join poblado
        },
        error: () => {
          this.toast.error('No se pudo vincular el servicio médico.');
        },
      });
  }

  deleteItem(item: CompanyItemInterface, event: Event): void {
    event.stopPropagation();
    const activeCmp = this.companyContext.activeCompany();
    if (!activeCmp?.cmp_uuid) return;

    const itemName = item.itm?.itm_name || 'este servicio';
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas desvincular el servicio "${itemName}" de la clínica? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    this.companyItemsService
      .deleteCompanyItem(activeCmp.cmp_uuid, item.itm_uuid, item.cmpitm_uuid)
      .subscribe({
        next: () => {
          this.toast.success(`Servicio "${itemName}" desvinculado con éxito.`);
        },
        error: () => {
          this.toast.error('No se pudo desvincular el servicio médico.');
        },
      });
  }

  onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filterQuery.set(input.value || '');
  }
}
