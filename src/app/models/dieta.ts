import { RecetaResponse } from './receta';

export interface PlanSemanalItem {
  receta_id: string;
  receta?: RecetaResponse;
  tipo_comida: string; // desayuno | almuerzo | cena | merienda
  dia: string;         // lunes | martes | miercoles | jueves | viernes | sabado | domingo
}

export interface DietaResponse {
  id: string;
  nombre_dieta: string;
  descripcion: string;
  metas: string[];
  plan_semanal: PlanSemanalItem[];
  es_personalizada: boolean;
  visibilidad: 'publica' | 'privada';
  portada: string | null;
  creada_por: string | null;
}

export interface DietaRequest {
  nombre_dieta: string;
  descripcion: string;
  metas: string[];
  plan_semanal: PlanSemanalItem[];
  es_personalizada: boolean;
  visibilidad: 'publica' | 'privada';
  creada_por: string | null;
}

export interface AgregarRecetaPlanRequest {
  receta_id: string;
  tipo_comida: string;
  dia: string;
}

export interface DietaIdResponse {
  id: string;
  mensaje: string;
}
