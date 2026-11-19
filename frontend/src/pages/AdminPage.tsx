import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BrandMark } from "../components/BrandMark";
import type { TabAdmin } from "./admin/types";
import UsuariosTab from "./admin/UsuariosTab";
import ServiciosTab from "./admin/ServiciosTab";
import ModulosTab from "./admin/ModulosTab";
import CategoriasTab from "./admin/CategoriasTab";
import ParametrosTab from "./admin/ParametrosTab";
import HistorialTab from "./admin/HistorialTab";

const TABS: { id: TabAdmin; label: string; icono: string }[] = [
  { id: "usuarios", label: "Usuarios", icono: "group" },
  { id: "servicios", label: "Servicios", icono: "category" },
  { id: "modulos", label: "Módulos de Atención", icono: "desktop_windows" },
  { id: "categorias", label: "Categorías", icono: "accessible" },
  { id: "parametros", label: "Parámetros del Sistema", icono: "tune" },
  { id: "historial", label: "Historial e Indicadores", icono: "analytics" },
];

export default function AdminPage() {
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabAdmin>("usuarios");

  function onLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-full flex flex-col bg-[#F4F5F7]">
      <header className="flex justify-between items-center w-full px-margin h-16 border-b border-surface-container-high bg-surface-container-lowest shadow-sm z-30 sticky top-0">
        <BrandMark subtitle="Plataforma de Administración y Control" />
        <div className="flex items-center gap-space-md">
          <div className="hidden xl:flex flex-col text-left leading-tight">
            <span className="text-label-md font-label-md text-on-surface">{sesion?.nombreCompleto}</span>
            <span className="text-body-sm font-body-sm text-secondary">Administrador</span>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-2 rounded-lg border border-surface-container-high bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="bg-surface-container-lowest border-b border-surface-container-high px-margin">
        <div className="max-w-[1600px] mx-auto flex items-center gap-space-lg overflow-x-auto custom-scroll">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-space-xs py-3.5 border-b-2 transition-all whitespace-nowrap ${
                tab === t.id
                  ? "border-primary-container text-on-surface font-title-md text-title-md"
                  : "border-transparent text-secondary hover:text-on-surface font-label-md text-label-md"
              }`}
            >
              <span className="material-symbols-outlined">{t.icono}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-margin py-space-lg flex flex-col gap-space-lg">
        {tab === "usuarios" && <UsuariosTab />}
        {tab === "servicios" && <ServiciosTab />}
        {tab === "modulos" && <ModulosTab />}
        {tab === "categorias" && <CategoriasTab />}
        {tab === "parametros" && <ParametrosTab />}
        {tab === "historial" && <HistorialTab />}
      </main>
    </div>
  );
}
