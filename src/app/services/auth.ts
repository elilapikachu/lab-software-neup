import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth';
import { recuperarPassword } from '../models/recuperarPassword';
import { Storage } from './storage';
import { AppConstants } from '../app.constantes'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_AUTH = AppConstants.API_URL + '/auth';

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_AUTH}/login`, request);
  }

  registro(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_AUTH}/registro`, request);
  }

  /** POST /api/auth/recuperar-password — envía contraseña temporal al email del usuario */
  recuperarPassword(dto: recuperarPassword): Observable<string> {
    return this.http.post(`${this.API_AUTH}/recuperar-password`, dto, { responseType: 'text' });
  }

  /** PUT /api/auth/cambiar-password — cambia la contraseña, desmarca el flag temporal */
  cambiarPassword(usuarioId: string, passwordActual: string, nuevaPassword: string): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.API_AUTH}/cambiar-password`, { usuarioId, passwordActual, nuevaPassword });
  }

  /** GET /api/auth/verificar-email — comprueba que el dominio tenga registros MX */
  verificarEmail(email: string): Observable<{ valido: boolean }> {
    return this.http.get<{ valido: boolean }>(`${this.API_AUTH}/verificar-email`, { params: { email } });
  }

  guardarSesion(response: AuthResponse): void {
    this.storage.setItem('usuarioId', response.usuarioId || '');
    this.storage.setItem('personaId', response.personaId || '');
    this.storage.setItem('nombreUsuario', response.nombreUsuario || '');
    this.storage.setItem('email', response.email || '');
  }

  cerrarSesion(): void {
    this.storage.removeItem('usuarioId');
    this.storage.removeItem('personaId');
    this.storage.removeItem('nombreUsuario');
    this.storage.removeItem('email');
  }

  estaAutenticado(): boolean {
    return !!this.storage.getItem('usuarioId');
  }

  getUsuarioId(): string | null {
    return this.storage.getItem('usuarioId');
  }

  getPersonaId(): string | null {
    return this.storage.getItem('personaId');
  }

  getNombreUsuario(): string | null {
    return this.storage.getItem('nombreUsuario');
  }
}