import { Navigate } from "react-router-dom";
import type { Rol } from "../api/types";
import { useAuth } from "./AuthContext";

export function RequireAuth({ roles, children }: { roles?: Rol[]; children: React.ReactNode }) {
  const { sesion, cargando } = useAuth();

  if (cargando) {
    return null;
  }

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(sesion.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
