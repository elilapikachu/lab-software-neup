export interface PerfilData {
 usuarioId?: string;
  username?: string;
  email?: string;
 
  // De persona
  personaId?: string;
  nombres?: string[];
  apellidos?: string[];
  telefono?: number;
  otroEmail?: string;
 
  // Físicos
  peso?: number;
  altura?: number;
  edad?: number;
 
  // Objetivos
  objetivos?: string[];
 
  // Actividad
  frecuenciaSemanal?: number;
  tipoActividad?: string[];
 
  // Alimentación
  tipoDieta?: string[];
  alergias?: string[];
  gustos?: string[];
  comidasAlDia?: number;
}
