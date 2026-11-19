import type {
  AccionTurno,
  Categoria,
  ConsultaTurnoPublico,
  EstadoTurno,
  HistorialTurno,
  Indicadores,
  Modulo,
  Pagina,
  Sesion,
  Servicio,
  Turno,
  TurnoPublico,
  Usuario,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const TOKEN_KEY = "turnos_bancolombia_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export class ApiException extends Error {
  status: number;
  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  const texto = await response.text();
  const data = texto ? JSON.parse(texto) : undefined;

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/api/v1/auth/")) {
      setToken(null);
      onUnauthorized?.();
    }
    const mensaje = data?.mensaje ?? `Error ${response.status}`;
    throw new ApiException(response.status, mensaje);
  }

  return data as T;
}

function query(params: Record<string, string | number | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}

export const authApi = {
  login: (username: string, password: string) =>
    request<Sesion>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
};

export const categoriasApi = {
  listar: () => request<Categoria[]>("/api/v1/categorias"),
  crear: (data: { nombre: string; esPreferente: boolean }) =>
    request<Categoria>("/api/v1/categorias", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id: number, data: { nombre: string; esPreferente: boolean }) =>
    request<Categoria>(`/api/v1/categorias/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

export const serviciosApi = {
  listar: () => request<Servicio[]>("/api/v1/servicios"),
  crear: (data: { nombre: string; prefijo: string; descripcion: string; activo?: boolean }) =>
    request<Servicio>("/api/v1/servicios", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id: number, data: { nombre: string; prefijo: string; descripcion: string; activo?: boolean }) =>
    request<Servicio>(`/api/v1/servicios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  activar: (id: number) => request<Servicio>(`/api/v1/servicios/${id}/activar`, { method: "PATCH" }),
  desactivar: (id: number) => request<Servicio>(`/api/v1/servicios/${id}/desactivar`, { method: "PATCH" }),
};

export const modulosApi = {
  listar: (servicioId?: number) => request<Modulo[]>(`/api/v1/modulos${query({ servicioId })}`),
  crear: (data: { codigo: string; nombre: string; servicioId: number; activo?: boolean }) =>
    request<Modulo>("/api/v1/modulos", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id: number, data: { codigo: string; nombre: string; servicioId: number; activo?: boolean }) =>
    request<Modulo>(`/api/v1/modulos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  activar: (id: number) => request<Modulo>(`/api/v1/modulos/${id}/activar`, { method: "PATCH" }),
  desactivar: (id: number) => request<Modulo>(`/api/v1/modulos/${id}/desactivar`, { method: "PATCH" }),
  llamarSiguiente: (id: number) => request<Turno>(`/api/v1/modulos/${id}/siguiente`, { method: "POST" }),
};

export const usuariosApi = {
  listar: () => request<Usuario[]>("/api/v1/usuarios"),
  crear: (data: { username: string; password: string; nombreCompleto: string; rol: string; activo?: boolean }) =>
    request<Usuario>("/api/v1/usuarios", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (
    id: number,
    data: { username: string; password?: string; nombreCompleto: string; rol: string; activo?: boolean },
  ) => request<Usuario>(`/api/v1/usuarios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  activar: (id: number) => request<Usuario>(`/api/v1/usuarios/${id}/activar`, { method: "PATCH" }),
  desactivar: (id: number) => request<Usuario>(`/api/v1/usuarios/${id}/desactivar`, { method: "PATCH" }),
};

export const turnosApi = {
  buscar: (filtros: {
    servicioId?: number;
    estado?: EstadoTurno;
    categoriaId?: number;
    desde?: string;
    hasta?: string;
    page?: number;
    size?: number;
  }) => request<Pagina<Turno>>(`/api/v1/turnos${query(filtros)}`),
  getById: (id: number) => request<Turno>(`/api/v1/turnos/${id}`),
  registrar: (data: { servicioId: number; categoriaId: number; nombreCliente: string }) =>
    request<Turno>("/api/v1/turnos", { method: "POST", body: JSON.stringify(data) }),
  cambiarEstado: (id: number, accion: AccionTurno, motivo?: string) =>
    request<Turno>(`/api/v1/turnos/${id}/estado`, { method: "PATCH", body: JSON.stringify({ accion, motivo }) }),
};

export const historialApi = {
  buscar: (filtros: {
    servicioId?: number;
    estado?: EstadoTurno;
    desde?: string;
    hasta?: string;
    page?: number;
    size?: number;
  }) => request<Pagina<HistorialTurno>>(`/api/v1/historial${query(filtros)}`),
  indicadores: (filtros: { servicioId?: number; desde?: string; hasta?: string }) =>
    request<Indicadores>(`/api/v1/historial/indicadores${query(filtros)}`),
};

export const parametrosApi = {
  obtener: () => request<{ umbralEnvejecimientoMinutos: number }>("/api/v1/parametros"),
  actualizar: (umbralEnvejecimientoMinutos: number) =>
    request<{ umbralEnvejecimientoMinutos: number }>("/api/v1/parametros", {
      method: "PUT",
      body: JSON.stringify({ umbralEnvejecimientoMinutos }),
    }),
};

export const publicoApi = {
  pantalla: () => request<TurnoPublico[]>("/api/v1/publico/pantalla"),
  consultarTurno: (codigo: string) =>
    request<ConsultaTurnoPublico>(`/api/v1/publico/turnos/${encodeURIComponent(codigo)}`),
};
