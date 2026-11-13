import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemsService } from '@services/items.service';
import { ToastService } from '@services/toast.service';
import { CreateItemDto, ItemInterface, UpdateItemDto } from '@interfaces/item';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
})
export class ItemsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly itemsService = inject(ItemsService);
  private readonly toast = inject(ToastService);

  readonly items = this.itemsService.items;
  readonly isLoading = this.itemsService.isLoading;
  readonly isSaving = this.itemsService.isSaving;

  // Estados locales
  readonly isModalOpen = signal<boolean>(false);
  readonly editingItem = signal<ItemInterface | null>(null);
  readonly filterQuery = signal<string>('');

  // Formulario reactivo
  itemForm: FormGroup = this.fb.group({
    itm_name: ['', [Validators.required, Validators.minLength(3)]],
    itm_description: [''],
  });

  // Lista filtrada computada
  readonly filteredItems = computed(() => {
    const query = this.filterQuery().trim().toLowerCase();
    const all = this.items();
    if (!query) return all;
    return all.filter((item) => {
      const name = (item.itm_name || '').toLowerCase();
      const desc = (item.itm_description || '').toLowerCase();
      return name.includes(query) || desc.includes(query);
    });
  });

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemsService.getItems('', 1, 200).subscribe();
  }

  openCreateModal(): void {
    this.editingItem.set(null);
    this.itemForm.reset({
      itm_name: '',
      itm_description: '',
    });
    this.isModalOpen.set(true);
  }

  openEditModal(item: ItemInterface): void {
    this.editingItem.set(item);
    this.itemForm.patchValue({
      itm_name: item.itm_name,
      itm_description: item.itm_description || '',
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    if (this.isSaving()) return;
    this.isModalOpen.set(false);
    this.editingItem.set(null);
    this.itemForm.reset();
  }

  saveItem(): void {
    if (this.itemForm.invalid || this.isSaving()) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formValues = this.itemForm.value;
    const current = this.editingItem();

    if (current) {
      // Edición
      const payload: UpdateItemDto = {
        itm_name: formValues.itm_name.trim(),
        itm_description: formValues.itm_description?.trim() || null,
      };

      this.itemsService.updateItem(current.itm_uuid, payload).subscribe({
        next: () => {
          this.toast.success('Prestación actualizada correctamente en el catálogo.');
          this.closeModal();
        },
        error: () => {
          this.toast.error('No se pudo actualizar la prestación en el catálogo.');
        },
      });
    } else {
      // Alta
      const payload: CreateItemDto = {
        itm_name: formValues.itm_name.trim(),
        itm_description: formValues.itm_description?.trim() || null,
      };

      this.itemsService.createItem(payload).subscribe({
        next: () => {
          this.toast.success('Prestación creada exitosamente en el catálogo maestro.');
          this.closeModal();
        },
        error: () => {
          this.toast.error('No se pudo crear la prestación en el catálogo.');
        },
      });
    }
  }

  deleteItem(item: ItemInterface, event: Event): void {
    event.stopPropagation();
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar "${item.itm_name}" del catálogo maestro? Las clínicas que ya tengan asignado este servicio no podrán vincularlo nuevamente.`
    );
    if (!confirmed) return;

    this.itemsService.deleteItem(item.itm_uuid).subscribe({
      next: () => {
        this.toast.success(`Prestación "${item.itm_name}" eliminada del catálogo.`);
      },
      error: () => {
        this.toast.error('No se pudo eliminar la prestación. Verificá si está asociada a alguna clínica.');
      },
    });
  }

  onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filterQuery.set(input.value || '');
  }
}
