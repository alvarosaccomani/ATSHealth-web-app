import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthData, AuthSingleResult, AuthUser, LoginCredentials } from '@interfaces/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _token = signal<string | null>(this.getStoredToken());
  private readonly _currentUser = signal<AuthUser | null>(this.getStoredUser());
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this._token()));

  /**
   * @description Realiza el inicio de sesión contra el endpoint /login de la API.
   *
   * @param credentials Datos de acceso del usuario (nick/email y password).
   * @returns Observable con el resultado del inicio de sesión.
   */
  login(credentials: LoginCredentials): Observable<AuthSingleResult> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const headers = new HttpHeaders().set('content-type', 'application/json');
    const body = {
      usr_user: credentials.usr_user.trim(),
      usr_password: credentials.usr_password,
      gettoken: credentials.gettoken ?? true,
    };

    return this.http
      .post<AuthSingleResult>(`${environment.apiUrl}login`, body, { headers })
      .pipe(
        tap({
          next: (res) => {
            this.isLoading.set(false);
            if (res && res.success && res.data) {
              const data = res.data;
              const extractedToken = typeof data === 'string' ? data : data.token;

              if (extractedToken) {
                this.setToken(extractedToken);
              }
              if (data.user) {
                this.setUser(data.user);
              }
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            const msg =
              err?.error?.message ||
              err?.error?.error ||
              err?.message ||
              'No se pudo conectar con el servicio de autenticación.';
            this.errorMessage.set(msg);
          },
        })
      );
  }

  /**
   * @description Cierra la sesión activa y elimina los datos almacenados localmente.
   */
  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    this.errorMessage.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ats_health_token');
      localStorage.removeItem('ats_health_user');
    }
  }

  private setToken(token: string): void {
    this._token.set(token);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ats_health_token', token);
    }
  }

  private setUser(user: AuthUser): void {
    this._currentUser.set(user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ats_health_user', JSON.stringify(user));
    }
  }

  private getStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('ats_health_token');
  }

  private getStoredUser(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem('ats_health_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
