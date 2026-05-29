import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactoForm } from '../models/correo';
import { AppConstants } from '../app.constantes';

@Injectable({
  providedIn: 'root'
})
export class CorreoService {
  private readonly API_EMAIL = AppConstants.API_URL + '/email';

  constructor(private http: HttpClient) {}

  enviarContacto(dto: ContactoForm): Observable<string> {
    return this.http.post(`${this.API_EMAIL}/contacto`, dto, { responseType: 'text' });
  }
}
