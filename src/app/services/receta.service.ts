import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecetaRequest, RecetaResponse, RecetaIdResponse, RecomendadasRecetasResponse } from '../models/receta';
import { AppConstants } from '../app.constantes';

@Injectable({ providedIn: 'root' })
export class RecetaService {

  private readonly API = AppConstants.API_URL + '/recetas';

  constructor(private http: HttpClient) {}

  /** GET /api/recetas/publicas */
  obtenerPublicas(): Observable<RecetaResponse[]> {
    return this.http.get<RecetaResponse[]>(`${this.API}/publicas`);
  }

  /** GET /api/recetas */
  obtenerTodas(): Observable<RecetaResponse[]> {
    return this.http.get<RecetaResponse[]>(this.API);
  }

  /** GET /api/recetas/{id} */
  obtenerPorId(id: string): Observable<RecetaResponse> {
    return this.http.get<RecetaResponse>(`${this.API}/${id}`);
  }

  /** GET /api/recetas/persona/{personaId} */
  obtenerPorPersona(personaId: string): Observable<RecetaResponse[]> {
    return this.http.get<RecetaResponse[]>(`${this.API}/persona/${personaId}`);
  }

  /** POST /api/recetas */
  crear(request: RecetaRequest): Observable<RecetaIdResponse> {
    return this.http.post<RecetaIdResponse>(this.API, request);
  }

  /** PUT /api/recetas/{id} */
  actualizar(id: string, request: RecetaRequest): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}`, request);
  }

  /** DELETE /api/recetas/{id} */
  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  /** POST /api/recetas/{id}/imagenes — multipart */
  agregarImagen(id: string, archivo: File, nombre?: string): Observable<RecetaIdResponse> {
    const form = new FormData();
    form.append('archivo', archivo);
    if (nombre) form.append('nombre', nombre);
    return this.http.post<RecetaIdResponse>(`${this.API}/${id}/imagenes`, form);
  }

  /** DELETE /api/recetas/{id}/imagenes/{imagenId} */
  eliminarImagen(id: string, imagenId: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}/imagenes/${imagenId}`);
  }

  /** GET /api/recetas/recomendadas/{personaId} */
  obtenerRecomendadas(personaId: string): Observable<RecomendadasRecetasResponse> {
    return this.http.get<RecomendadasRecetasResponse>(`${this.API}/recomendadas/${personaId}`);
  }
}
