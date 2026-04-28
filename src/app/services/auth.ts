import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth';
 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  private readonly API_URL = 'http://localhost:8080/api/auth';
 
  constructor(private http: HttpClient) {}
 
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request);
  }
 
  registro(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/registro`, request);
  }
 
  guardarSesion(response: AuthResponse): void {
    localStorage.setItem('usuarioId', response.usuarioId || '');
    localStorage.setItem('personaId', response.personaId || '');
    localStorage.setItem('nombreUsuario', response.nombreUsuario || '');
    localStorage.setItem('email', response.email || '');
  }
 
  cerrarSesion(): void {
    localStorage.clear();
  }
 
  estaAutenticado(): boolean {
    return !!localStorage.getItem('usuarioId');
  }
 
  getUsuarioId(): string | null {
    return localStorage.getItem('usuarioId');
  }
 
  getNombreUsuario(): string | null {
    return localStorage.getItem('nombreUsuario');
  }
}