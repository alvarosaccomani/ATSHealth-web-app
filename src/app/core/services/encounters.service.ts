import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CreateEncounterPayload,
  EncounterInterface,
  EncounterSingleResult,
} from '@interfaces/encounter';
import { SingleResult } from '@interfaces/common';

@Injectable({
  providedIn: 'root',
})
export class EncountersService {
  private readonly http = inject(HttpClient);

  readonly encounters = signal<EncounterInterface[]>([]);
  readonly patientHistory = this.encounters.asReadonly();
  readonly activeEncounter = signal<EncounterInterface | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  selectEncounter(encounter: EncounterInterface | null): void {
    this.activeEncounter.set(encounter);
  }

  clearActiveEncounter(): void {
    this.activeEncounter.set(null);
  }

  /**
   * @description Registra o guarda una nueva consulta médica clínica.
   */
  saveEncounter(payload: CreateEncounterPayload): Observable<EncounterSingleResult> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders().set('content-type', 'application/json');

    return this.http
      .post<EncounterSingleResult>(`${environment.apiUrl}encounter`, payload, { headers })
      .pipe(
        tap({
          next: (res) => {
            this.isSaving.set(false);
            if (res?.data) {
              this.activeEncounter.set(res.data);
              this.encounters.update((list) => [res.data, ...list]);
            }
          },
          error: (err) => {
            this.isSaving.set(false);
            const msg =
              err?.error?.message ||
              err?.error?.error ||
              err?.message ||
              'Error al guardar la consulta médica.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Recupera el historial de consultas de un paciente en una clínica.
   */
  getEncountersByPatient(
    pat_uuid: string,
    cmp_uuid: string
  ): Observable<SingleResult<EncounterInterface[]>> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('x-company-uuid', cmp_uuid);

    return this.http
      .get<SingleResult<EncounterInterface[]>>(
        `${environment.apiUrl}encounters/patient/${pat_uuid}?cmp_uuid=${encodeURIComponent(cmp_uuid)}`,
        { headers }
      )
      .pipe(
        tap({
          next: (res) => {
            this.isLoading.set(false);
            const list = res?.data && Array.isArray(res.data) ? res.data : [];
            this.encounters.set(list);
          },
          error: (err) => {
            this.isLoading.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al recuperar el historial de consultas.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Recupera una consulta clínica específica por su UUID.
   */
  getEncounterById(enc_uuid: string, cmp_uuid: string): Observable<EncounterSingleResult> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('x-company-uuid', cmp_uuid);

    return this.http
      .get<EncounterSingleResult>(
        `${environment.apiUrl}encounter/${enc_uuid}?cmp_uuid=${encodeURIComponent(cmp_uuid)}`,
        { headers }
      )
      .pipe(
        tap({
          next: (res) => {
            this.isLoading.set(false);
            if (res?.data) {
              this.activeEncounter.set(res.data);
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            const msg =
              err?.error?.message ||
              err?.message ||
              'Error al obtener la consulta médica.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Actualiza una consulta médica existente.
   */
  updateEncounter(
    enc_uuid: string,
    payload: Partial<CreateEncounterPayload>
  ): Observable<EncounterSingleResult> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders().set('content-type', 'application/json');

    return this.http
      .put<EncounterSingleResult>(
        `${environment.apiUrl}encounter/${enc_uuid}`,
        payload,
        { headers }
      )
      .pipe(
        tap({
          next: (res) => {
            this.isSaving.set(false);
            if (res?.data) {
              this.activeEncounter.set(res.data);
            }
          },
          error: (err) => {
            this.isSaving.set(false);
            const msg =
              err?.error?.message ||
              err?.error?.error ||
              err?.message ||
              'Error al actualizar la consulta médica.';
            this.errorMessage.set(msg);
          },
        })
      );
  }
}
