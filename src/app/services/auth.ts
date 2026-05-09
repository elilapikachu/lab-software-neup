import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth';
import { Storage } from './storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request);
  }

  registro(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/registro`, request);
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

  getNombreUsuario(): string | null {
    return this.storage.getItem('nombreUsuario');
  }
}