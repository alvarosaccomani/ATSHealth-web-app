import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PatientInterface, PatientResults, PatientSingleResult } from '@interfaces/patient';

/**
 * @description Servicio inyectable encargado de la lógica de negocio y comunicación con la API para patients.
 */
@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  /**
   * @description Señal con la lista reactiva de pacientes provenientes de la API.
   */
  readonly patients = signal<PatientInterface[]>([]);

  /**
   * @description Señal con el paciente actualmente seleccionado para consulta clínica.
   */
  readonly activePatient = signal<PatientInterface | null>(null);

  /**
   * @description Indicador de carga en progreso para peticiones HTTP.
   */
  readonly isLoading = signal<boolean>(false);

  /**
   * @description Mensaje de error si la petición a la API falla.
   */
  readonly errorMessage = signal<string | null>(null);

  /**
   * @description Término de búsqueda aplicado en el listado.
   */
  readonly searchTerm = signal<string>('');

  /**
   * @description Filtro por sexo biológico / protocolo ('todos' | 'femenino' | 'masculino').
   */
  readonly sexFilter = signal<string>('todos');

  /**
   * @description Filtro por estado ('todos' | 'activos' | 'inactivos').
   */
  readonly statusFilter = signal<string>('todos');

  /**
   * @description Lista computada reactiva filtrada según búsqueda, sexo y estado.
   */
  readonly filteredPatients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const sex = this.sexFilter().toLowerCase();
    const status = this.statusFilter();

    return this.patients().filter((p) => {
      const matchesTerm =
        !term ||
        p.pat_firstname.toLowerCase().includes(term) ||
        p.pat_lastname.toLowerCase().includes(term) ||
        p.pat_documentnumber.toLowerCase().includes(term) ||
        (p.pat_email && p.pat_email.toLowerCase().includes(term)) ||
        (p.pat_medicalcoverage && p.pat_medicalcoverage.toLowerCase().includes(term));

      const matchesSex = sex === 'todos' || p.pat_biologicalsex.toLowerCase() === sex;

      const matchesStatus =
        status === 'todos' ||
        (status === 'activos' && p.pat_active) ||
        (status === 'inactivos' && !p.pat_active);

      return matchesTerm && matchesSex && matchesStatus;
    });
  });

  /**
   * @description Métricas agregadas computadas del listado de pacientes.
   */
  readonly stats = computed(() => {
    const list = this.patients();
    return {
      total: list.length,
      active: list.filter((p) => p.pat_active).length,
      female: list.filter((p) => p.pat_biologicalsex === 'femenino').length,
      male: list.filter((p) => p.pat_biologicalsex === 'masculino').length,
    };
  });

  /**
   * @description Inicializa una nueva instancia de la clase.
   *
   * @param _http Instancia inyectada de HttpClient.
   */
  constructor(private _http: HttpClient) {}

  /**
   * @description Obtiene o recupera los datos correspondientes a patients desde la API.
   *
   * @param pat_uuid Parámetro pat_uuid opcional para filtrar.
   * @returns Observable con la respuesta de pacientes de la API.
   */
  public getPatients(pat_uuid?: string): Observable<PatientResults> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders().set('content-type', 'application/json');

    let route = 'patients';
    if (pat_uuid && pat_uuid !== 'null') {
      route += `?pat_uuid=${pat_uuid}`;
    }

    return this._http
      .get<PatientResults>(environment.apiUrl + route, { headers })
      .pipe(
        tap({
          next: (res) => {
            this.isLoading.set(false);
            const list = res && Array.isArray(res.data) ? res.data : [];
            this.patients.set(list);
            if (list.length > 0 && !this.activePatient()) {
              this.activePatient.set(list[0]);
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'No se pudo conectar con el servidor de la API.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Obtiene un paciente unitario por su UUID desde la API.
   *
   * @param pat_uuid Identificador único del paciente.
   * @returns Observable con la respuesta del paciente solicitado.
   */
  public getPatientById(pat_uuid: string): Observable<PatientSingleResult> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<PatientSingleResult>(
      `${environment.apiUrl}patients/${pat_uuid}`,
      { headers }
    );
  }

  /**
   * @description Selecciona el paciente activo para la historia clínica.
   *
   * @param patient Modelo del paciente a seleccionar.
   */
  public selectPatient(patient: PatientInterface): void {
    this.activePatient.set(patient);
  }

  /**
   * @description Actualiza el término de búsqueda para filtrado reactivo.
   *
   * @param term Texto a buscar.
   */
  public setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  /**
   * @description Establece el filtro de sexo biológico / protocolo.
   *
   * @param sex 'todos' | 'femenino' | 'masculino'.
   */
  public setSexFilter(sex: string): void {
    this.sexFilter.set(sex);
  }

  /**
   * @description Establece el filtro de estado activo / inactivo.
   *
   * @param status 'todos' | 'activos' | 'inactivos'.
   */
  public setStatusFilter(status: string): void {
    this.statusFilter.set(status);
  }

  /**
   * @description Calcula la edad actual en años cumplidos a partir de la fecha de nacimiento.
   *
   * @param birthdate Fecha en formato ISO YYYY-MM-DD.
   * @returns Edad en años.
   */
  public calculateAge(birthdate: string): number {
    if (!birthdate) return 0;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }

  /**
   * @description Alterna el estado activo/inactivo de un paciente.
   *
   * @param uuid Identificador único del paciente.
   */
  public togglePatientStatus(uuid: string): void {
    this.patients.update((list) =>
      list.map((p) =>
        p.pat_uuid === uuid
          ? { ...p, pat_active: !p.pat_active, pat_updatedat: new Date() }
          : p
      )
    );
  }
}
