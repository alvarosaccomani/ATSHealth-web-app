import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CompanyContextService } from '@services/company-context.service';
import { UserRolesCompanyService } from '@services/user-roles-company.service';
import { UsersService } from '@services/users.service';
import { ToastService } from '@services/toast.service';
import { UserRolCompanyInterface, UserSummaryEntity } from '@interfaces/user-rol-company';

@Component({
  selector: 'app-company-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './company-users.component.html',
  styleUrl: './company-users.component.scss',
})
export class CompanyUsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly companyContext = inject(CompanyContextService);
  private readonly userRolesCompanyService = inject(UserRolesCompanyService);
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastService);

  readonly members = signal<UserRolCompanyInterface[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly isAddModalOpen = signal<boolean>(false);

  // Estados reactivos para la búsqueda predictiva de usuarios
  readonly searchResults = signal<UserSummaryEntity[]>([]);
  readonly selectedUser = signal<UserSummaryEntity | null>(null);
  readonly isSearching = signal<boolean>(false);
  readonly hasSearched = signal<boolean>(false);

  // Formulario reactivo
  addMemberForm: FormGroup = this.fb.group({
    search_query: [''],
    rol_uuid: ['1e1eda23-9c30-4bca-8785-d802ad96c1c3', [Validators.required]],
  });

  // Roles predefinidos del sistema (sincronizados con la tabla rol_roles)
  readonly availableRoles = [
    { uuid: '1e1eda23-9c30-4bca-8785-d802ad96c1c3', label: 'Administrador Clínico', badge: 'Admin' },
    { uuid: 'a4f57dd9-4461-42ba-bbe3-7870f383b9ed', label: 'Super Administrador (SysAdmin)', badge: 'SysAdmin' },
  ];

  ngOnInit(): void {
    this.loadMembers();
    this.setupSearchWatcher();
  }

  loadMembers(): void {
    const activeCmp = this.companyContext.activeCompany();
    if (!activeCmp?.cmp_uuid) return;

    this.isLoading.set(true);
    this.userRolesCompanyService.getUserRolesCompany(activeCmp.cmp_uuid).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.members.set(res.data || []);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('No se pudieron recuperar los miembros de la clínica.');
      },
    });
  }

  private setupSearchWatcher(): void {
    this.addMemberForm.get('search_query')?.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged()
      )
      .subscribe((query: string) => {
        const term = query?.trim();
        if (!term || term.length < 2) {
          this.searchResults.set([]);
          this.hasSearched.set(false);
          this.isSearching.set(false);
          return;
        }

        // Si ya hay un usuario seleccionado con ese texto, no volver a buscar
        if (this.selectedUser()) {
          return;
        }

        this.isSearching.set(true);
        this.usersService.getUsers(term, 1, 10).subscribe({
          next: (res) => {
            this.isSearching.set(false);
            this.hasSearched.set(true);
            const list: UserSummaryEntity[] = res?.data || [];
            
            // Excluir los que ya son miembros de la clínica activa
            const currentMemberUuids = new Set(this.members().map(m => m.usr_uuid));
            const filtered = list.filter(u => !currentMemberUuids.has(u.usr_uuid));
            this.searchResults.set(filtered);
          },
          error: () => {
            this.isSearching.set(false);
            this.hasSearched.set(true);
            this.searchResults.set([]);
          }
        });
      });
  }

  selectUser(user: UserSummaryEntity): void {
    this.selectedUser.set(user);
    this.searchResults.set([]);
    this.addMemberForm.get('search_query')?.setValue(`${user.usr_name} ${user.usr_surname || ''} (${user.usr_email})`, { emitEvent: false });
  }

  clearSelectedUser(): void {
    this.selectedUser.set(null);
    this.searchResults.set([]);
    this.hasSearched.set(false);
    this.addMemberForm.get('search_query')?.setValue('');
  }

  openAddModal(): void {
    this.clearSelectedUser();
    this.addMemberForm.reset({
      search_query: '',
      rol_uuid: '1e1eda23-9c30-4bca-8785-d802ad96c1c3',
    });
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
    this.clearSelectedUser();
  }

  submitAddMember(): void {
    const user = this.selectedUser();
    if (!user) {
      this.toast.warning('Buscá y seleccioná un profesional registrado para vincularlo.');
      return;
    }

    const activeCmp = this.companyContext.activeCompany();
    if (!activeCmp?.cmp_uuid) {
      this.toast.error('No hay una clínica activa seleccionada.');
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.addMemberForm.value;

    const payload = {
      cmp_uuid: activeCmp.cmp_uuid,
      usr_uuid: user.usr_uuid,
      rol_uuid: formVal.rol_uuid,
    };

    this.userRolesCompanyService.saveUserRolCompany(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success(`¡${user.usr_name} ${user.usr_surname || ''} incorporado al equipo con éxito!`);
        this.closeAddModal();
        this.loadMembers();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          'No se pudo vincular al usuario a la clínica.';
        this.toast.error(msg);
      },
    });
  }

  removeMember(member: UserRolCompanyInterface): void {
    const memberName = member.usr
      ? `${member.usr.usr_name} ${member.usr.usr_surname || ''}`
      : 'este usuario';

    const confirmDelete = confirm(
      `¿Estás seguro de desvincular a ${memberName} de la clínica "${this.companyContext.activeCompany()?.cmp_name}"?`
    );
    if (!confirmDelete) return;

    this.userRolesCompanyService
      .deleteUserRolCompany(member.cmp_uuid, member.usr_uuid, member.rol_uuid)
      .subscribe({
        next: () => {
          this.toast.success('Miembro desvinculado de la clínica.');
          this.loadMembers();
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            err?.error?.error ||
            'Error al desvincular al miembro.';
          this.toast.error(msg);
        },
      });
  }
}
