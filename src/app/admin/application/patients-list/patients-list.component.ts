import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PatientsService } from '@services/patients.service';
import { ToastService } from '@services/toast.service';
import { PatientInterface } from '@interfaces/patient';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './patients-list.component.html',
  styleUrl: './patients-list.component.scss',
})
export class PatientsListComponent implements OnInit {
  readonly patientsService = inject(PatientsService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly selectedPatientModal = signal<PatientInterface | null>(null);

  readonly patients = this.patientsService.filteredPatients;
  readonly stats = this.patientsService.stats;
  readonly currentSearch = this.patientsService.searchTerm;
  readonly currentSexFilter = this.patientsService.sexFilter;
  readonly currentStatusFilter = this.patientsService.statusFilter;
  readonly isLoading = this.patientsService.isLoading;
  readonly errorMessage = this.patientsService.errorMessage;

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.patientsService.getPatients().subscribe();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.patientsService.setSearchTerm(input.value);
  }

  clearSearch(): void {
    this.patientsService.setSearchTerm('');
  }

  setSexFilter(sex: string): void {
    this.patientsService.setSexFilter(sex);
  }

  setStatusFilter(status: string): void {
    this.patientsService.setStatusFilter(status);
  }

  calculateAge(birthdate: string): number {
    return this.patientsService.calculateAge(birthdate);
  }

  getInitials(firstName: string, lastName: string): string {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}`;
  }

  openRecord(patient: PatientInterface): void {
    this.patientsService.selectPatient(patient);
    this.toast.success(
      `Ficha clínica cargada para ${patient.pat_firstname} ${patient.pat_lastname}`
    );
    this.router.navigate(['/admin/application/encounter']);
  }

  viewDetails(patient: PatientInterface): void {
    this.selectedPatientModal.set(patient);
  }

  closeDetails(): void {
    this.selectedPatientModal.set(null);
  }

  toggleActive(patient: PatientInterface, event: Event): void {
    event.stopPropagation();
    this.patientsService.togglePatientStatus(patient.pat_uuid);
    const updatedStatus = !patient.pat_active;
    this.toast.info(
      `Paciente ${patient.pat_firstname} ${patient.pat_lastname} marcado como ${
        updatedStatus ? 'Activo' : 'Inactivo'
      }`
    );
  }
}
