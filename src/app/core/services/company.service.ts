import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyEntity, CompanyResults, CompanySingleResult } from '@interfaces/company';
import { AuthService } from '@services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders().set('content-type', 'application/json');
    const token = this.authService.token();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * @description Obtiene todas las empresas/clínicas registradas.
   */
  getCompanies(): Observable<CompanyResults> {
    return this.http.get<CompanyResults>(`${environment.apiUrl}companies`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * @description Obtiene una empresa por su UUID.
   */
  getCompanyById(cmp_uuid: string): Observable<CompanySingleResult> {
    return this.http.get<CompanySingleResult>(`${environment.apiUrl}company/${cmp_uuid}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * @description Crea una nueva empresa/clínica en el sistema.
   */
  createCompany(company: Partial<CompanyEntity>): Observable<CompanySingleResult> {
    return this.http.post<CompanySingleResult>(`${environment.apiUrl}company`, company, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * @description Actualiza los datos y branding de una empresa/clínica existente.
   */
  updateCompany(cmp_uuid: string, company: Partial<CompanyEntity>): Observable<CompanySingleResult> {
    return this.http.put<CompanySingleResult>(`${environment.apiUrl}company/${cmp_uuid}`, company, {
      headers: this.getAuthHeaders(),
    });
  }
}
