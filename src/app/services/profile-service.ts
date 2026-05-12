// src/app/services/perfil.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfilData } from '../models/perfil';
import { AppConstants } from '../app.constantes'

@Injectable({ providedIn: 'root' })
export class PerfilService {
 
  private readonly API_PERSONA = AppConstants.API_URL + '/persona';
 
  constructor(private http: HttpClient) {}
 
  /** GET /api/persona/{usuarioId} */
  obtenerPerfil(usuarioId: string): Observable<PerfilData> {
    return this.http.get<PerfilData>(`${this.API_PERSONA}/${usuarioId}`);
  }
 
  /** PUT /api/persona/{usuarioId} */
  guardarPerfil(usuarioId: string, dto: PerfilData): Observable<PerfilData> {
    return this.http.put<PerfilData>(`${this.API_PERSONA}/${usuarioId}`, dto);
  }
}