import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConstants } from '../app.constantes';
import { RecetaResponse } from '../models/receta';
import { DietaResponse } from '../models/dieta';

@Injectable({ providedIn: 'root' })
export class GuardadosService {

  private readonly API = AppConstants.API_URL + '/persona';

  constructor(private http: HttpClient) {}

  // ── Recetas ──────────────────────────────────────────────────────────────
  isRecetaGuardada(personaId: string, recetaId: string): Observable<{ guardada: boolean }> {
    return this.http.get<{ guardada: boolean }>(`${this.API}/${personaId}/recetas/guardadas/${recetaId}/estado`);
  }

  guardarReceta(personaId: string, recetaId: string): Observable<void> {
    return this.http.post<void>(`${this.API}/${personaId}/recetas/guardadas/${recetaId}`, {});
  }

  desguardarReceta(personaId: string, recetaId: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${personaId}/recetas/guardadas/${recetaId}`);
  }

  getRecetasGuardadas(personaId: string): Observable<RecetaResponse[]> {
    return this.http.get<RecetaResponse[]>(`${this.API}/${personaId}/recetas/guardadas`);
  }

  // ── Dietas ───────────────────────────────────────────────────────────────
  isDietaGuardada(personaId: string, dietaId: string): Observable<{ guardada: boolean }> {
    return this.http.get<{ guardada: boolean }>(`${this.API}/${personaId}/dietas/guardadas/${dietaId}/estado`);
  }

  guardarDieta(personaId: string, dietaId: string): Observable<void> {
    return this.http.post<void>(`${this.API}/${personaId}/dietas/guardadas/${dietaId}`, {});
  }

  desguardarDieta(personaId: string, dietaId: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${personaId}/dietas/guardadas/${dietaId}`);
  }

  getDietasGuardadas(personaId: string): Observable<DietaResponse[]> {
    return this.http.get<DietaResponse[]>(`${this.API}/${personaId}/dietas/guardadas`);
  }
}
