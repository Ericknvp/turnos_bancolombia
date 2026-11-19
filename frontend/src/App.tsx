import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import LoginPage from "./pages/LoginPage";
import OperadorPage from "./pages/OperadorPage";
import RegistrarTurnoPage from "./pages/RegistrarTurnoPage";
import AdminPage from "./pages/AdminPage";
import SalaEsperaPage from "./pages/SalaEsperaPage";
import ConsultaPublicaPage from "./pages/ConsultaPublicaPage";

function Home() {
  const { sesion, cargando } = useAuth();
  if (cargando) return null;
  if (!sesion) return <Navigate to="/login" replace />;
  if (sesion.rol === "ADMINISTRADOR") return <Navigate to="/admin" replace />;
  return <Navigate to="/operador" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/publico/pantalla" element={<SalaEsperaPage />} />
      <Route path="/publico/consulta" element={<ConsultaPublicaPage />} />
      <Route
        path="/operador"
        element={
          <RequireAuth roles={["OPERADOR", "ADMINISTRADOR"]}>
            <OperadorPage />
          </RequireAuth>
        }
      />
      <Route
        path="/operador/registrar"
        element={
          <RequireAuth roles={["OPERADOR", "ADMINISTRADOR"]}>
            <RegistrarTurnoPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth roles={["ADMINISTRADOR"]}>
            <AdminPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
