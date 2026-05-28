export interface Correo {
    to?: string;
    subject?: string;
    body?: string;
}

export interface ContactoForm {
    nombre: string;
    email: string;
    asunto: string;
    mensaje: string;
}