export type Rol = "ADMINISTRADOR" | "OPERADOR";

export type EstadoTurno =
  | "EN_ESPERA"
  | "LLAMADO"
  | "EN_ATENCION"
  | "FINALIZADO"
  | "CANCELADO"
  | "AUSENTE";

export type AccionTurno = "INICIAR" | "FINALIZAR" | "CANCELAR" | "MARCAR_AUSENTE";

export interface Sesion {
  token: string;
  id: number;
  username: string;
  nombreCompleto: string;
  rol: Rol;
}

export interface Usuario {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: Rol;
  activo: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
  esPreferente: boolean;
}

export interface Servicio {
  id: number;
  nombre: string;
  prefijo: string;
  descripcion: string;
  activo: boolean;
}

export interface Modulo {
  id: number;
  codigo: string;
  nombre: string;
  servicio: Servicio;
  activo: boolean;
}

export interface Turno {
  id: number;
  codigo: string;
  servicio: Servicio;
  categoria: Categoria;
  fecha: string;
  consecutivo: number;
  estado: EstadoTurno;
  nombreCliente: string;
  fechaIngreso: string;
  fechaLlamado: string | null;
  fechaInicioAtencion: string | null;
  fechaFin: string | null;
  modulo: Modulo | null;
  operador: Usuario | null;
  motivo: string | null;
}

export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface HistorialTurno {
  id: number;
  turno: Turno;
  estadoAnterior: EstadoTurno | null;
  estadoNuevo: EstadoTurno;
  fecha: string;
  operador: Usuario | null;
  motivo: string | null;
}

export interface Indicadores {
  turnosEmitidos: number;
  finalizados: number;
  cancelados: number;
  ausentes: number;
  promedioEsperaMinutos: number;
}

export interface TurnoPublico {
  codigo: string;
  servicio: string;
  modulo: string | null;
  estado: EstadoTurno;
  categoria: string;
  esPreferente: boolean;
}

export interface ConsultaTurnoPublico {
  codigo: string;
  servicio: string;
  categoria: string;
  esPreferente: boolean;
  estado: EstadoTurno;
  modulo: string | null;
  posicionEnFila: number | null;
  tiempoEstimadoMinutos: number | null;
}

export interface ApiError {
  fecha: string;
  status: number;
  error: string;
  mensaje: string;
}
