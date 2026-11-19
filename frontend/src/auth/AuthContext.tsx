import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, getToken, setToken, setUnauthorizedHandler } from "../api/client";
import type { Rol, Sesion } from "../api/types";

interface SesionUsuario {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: Rol;
}

const SESION_KEY = "turnos_bancolombia_sesion";

interface AuthContextValue {
  sesion: SesionUsuario | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<SesionUsuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = getToken();
    const guardada = localStorage.getItem(SESION_KEY);
    if (token && guardada) {
      setSesion(JSON.parse(guardada));
    }
    setCargando(false);

    setUnauthorizedHandler(() => {
      localStorage.removeItem(SESION_KEY);
      setSesion(null);
    });
  }, []);

  async function login(username: string, password: string) {
    const data: Sesion = await authApi.login(username, password);
    setToken(data.token);
    const usuario: SesionUsuario = {
      id: data.id,
      username: data.username,
      nombreCompleto: data.nombreCompleto,
      rol: data.rol,
    };
    localStorage.setItem(SESION_KEY, JSON.stringify(usuario));
    setSesion(usuario);
    return usuario;
  }

  function logout() {
    setToken(null);
    localStorage.removeItem(SESION_KEY);
    setSesion(null);
  }

  return (
    <AuthContext.Provider value={{ sesion, cargando, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
