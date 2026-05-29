export interface Ingrediente {
  ingrediente_id?: string;
  nombre_ingrediente: string;
  cantidad: number;
  tipo_ingrediente: string;
  tipo_cantidad?: string;
}
 
export interface Nutricion {
  kcal: number;
  proteinas: number;
  carbohidratos: number;
  fibra: number;
  vitaminas: string[];
  minerales: string[];
}
 
 
export interface RecetaResponse {
  id: string;
  nombre_receta: string;
  ingredientes: Ingrediente[];
  nutricion: Nutricion;
  tags: string[];
  tiempo_preparacion: string;
  creada_por: string | null;
  es_personalizada: boolean;
  visibilidad: 'publica' | 'privada';
  imagen: string[]; // lista de documentoIds
}
 
 
export interface RecetaRequest {
  nombre_receta: string;
  ingredientes: Ingrediente[];
  nutricion: Nutricion;
  tags: string[];
  tiempo_preparacion: string;
  creada_por: string | null;
  es_personalizada: boolean;
  visibilidad: 'publica' | 'privada';
}
 
 
export interface RecetaIdResponse {
  id: string;
  mensaje: string;
}

export interface RecomendadasRecetasResponse {
  tiene_preferencias: boolean;
  recetas: RecetaResponse[];
}