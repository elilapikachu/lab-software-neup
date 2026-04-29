// src/app/services/perfil.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfilData } from '../models/perfil';

 
@Injectable({ providedIn: 'root' })
export class PerfilService {
 
  private readonly base = 'http://localhost:8080/api/persona';
 
  constructor(private http: HttpClient) {}
 
  /** GET /api/persona/{usuarioId} */
  obtenerPerfil(usuarioId: string): Observable<PerfilData> {
    return this.http.get<PerfilData>(`${this.base}/${usuarioId}`);
  }
 
  /** PUT /api/persona/{usuarioId} */
  guardarPerfil(usuarioId: string, dto: PerfilData): Observable<PerfilData> {
    return this.http.put<PerfilData>(`${this.base}/${usuarioId}`, dto);
  }
}