import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConstants } from '../app.constantes';
import { IngredienteResponse } from '../models/ingrediente';

@Injectable({ providedIn: 'root' })
export class IngredienteService {
  private base = `${AppConstants.API_URL}/ingredientes`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<IngredienteResponse[]> {
    return this.http.get<IngredienteResponse[]>(this.base);
  }
}
