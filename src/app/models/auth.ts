export interface Auth {}

export interface LoginRequest {
  usuario: string;
  password: string;
}
 
export interface RegisterRequest {
  usuario: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: number;
  peso?: number;
  altura?: number;
}
 
export interface AuthResponse {
  success: boolean;
  message: string;
  usuarioId?: string;
  personaId?: string;
  nombreUsuario?: string;
  email?: string;
  passwordTemporal?: boolean;
}