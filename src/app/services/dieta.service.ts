import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DietaRequest, DietaResponse, DietaIdResponse, AgregarRecetaPlanRequest, RecomendadasDietasResponse } from '../models/dieta';
import { AppConstants } from '../app.constantes';

@Injectable({ providedIn: 'root' })
export class DietaService {

  private readonly API = AppConstants.API_URL + '/dietas';

  constructor(private http: HttpClient) {}

  /** GET /api/dietas/publicas */
  obtenerPublicas(): Observable<DietaResponse[]> {
    return this.http.get<DietaResponse[]>(`${this.API}/publicas`);
  }

  /** GET /api/dietas */
  obtenerTodas(): Observable<DietaResponse[]> {
    return this.http.get<DietaResponse[]>(this.API);
  }

  /** GET /api/dietas/{id} */
  obtenerPorId(id: string): Observable<DietaResponse> {
    return this.http.get<DietaResponse>(`${this.API}/${id}`);
  }

  /** GET /api/dietas/persona/{personaId} */
  obtenerPorPersona(personaId: string): Observable<DietaResponse[]> {
    return this.http.get<DietaResponse[]>(`${this.API}/persona/${personaId}`);
  }

  /** POST /api/dietas */
  crear(request: DietaRequest): Observable<DietaIdResponse> {
    return this.http.post<DietaIdResponse>(this.API, request);
  }

  /** PUT /api/dietas/{id} */
  actualizar(id: string, request: DietaRequest): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}`, request);
  }

  /** DELETE /api/dietas/{id} */
  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  /** POST /api/dietas/{id}/plan */
  agregarRecetaAlPlan(id: string, request: AgregarRecetaPlanRequest): Observable<void> {
    return this.http.post<void>(`${this.API}/${id}/plan`, request);
  }

  /** DELETE /api/dietas/{id}/plan/{recetaId} */
  eliminarRecetaDelPlan(id: string, recetaId: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}/plan/${recetaId}`);
  }

  /** POST /api/dietas/{id}/portada — multipart */
  subirPortada(id: string, archivo: File, nombre?: string): Observable<DietaIdResponse> {
    const form = new FormData();
    form.append('archivo', archivo);
    if (nombre) form.append('nombre', nombre);
    return this.http.post<DietaIdResponse>(`${this.API}/${id}/portada`, form);
  }

  /** GET /api/dietas/recomendadas/{personaId} */
  obtenerRecomendadas(personaId: string): Observable<RecomendadasDietasResponse> {
    return this.http.get<RecomendadasDietasResponse>(`${this.API}/recomendadas/${personaId}`);
  }
}
