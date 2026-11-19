import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiException } from "../api/client";
import { BrandMark } from "../components/BrandMark";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const sesion = await login(username, password);
      navigate(sesion.rol === "ADMINISTRADOR" ? "/admin" : "/operador");
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-[#F4F5F7]">
      <header className="flex items-center justify-between px-margin h-16 border-b border-surface-container-high bg-surface-container-lowest">
        <BrandMark />
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low border border-surface-container-high text-on-surface font-label-md text-label-md">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
          Canal Seguro Institucional
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-margin">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-lg border border-surface-container-high shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-primary-container" />
          <div className="p-space-xl flex flex-col gap-space-md">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px] text-on-surface">desktop_windows</span>
              </div>
              <h1 className="text-headline-md font-headline-md font-bold text-on-surface">Portal de Turnos</h1>
              <p className="text-body-sm text-secondary">
                Sede Central · Acceso para operadores y administradores
              </p>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-space-md mt-2">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-secondary uppercase tracking-wider">
                  Usuario
                </label>
                <input
                  className="w-full bg-surface border border-surface-container-high rounded p-2.5 text-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-on-surface outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin, operador1..."
                  autoFocus
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-secondary uppercase tracking-wider">
                  Contraseña
                </label>
                <input
                  type="password"
                  className="w-full bg-surface border border-surface-container-high rounded p-2.5 text-body-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-on-surface outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-50 border border-red-200 text-error font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="flex items-center justify-center gap-2 bg-primary-container hover:bg-[#E6C700] active:bg-[#CCB100] text-on-surface font-title-md text-title-md font-bold px-5 py-3 rounded shadow-sm transition-all disabled:opacity-60"
              >
                {cargando ? "Ingresando..." : "Iniciar sesión"}
                {!cargando && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>
            </form>

            <div className="flex items-center justify-center gap-4 pt-2 border-t border-surface-container-low text-body-sm text-secondary">
              <a href="/publico/pantalla" className="flex items-center gap-1 hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">tv</span>
                Monitor TV
              </a>
              <span className="text-surface-dim">|</span>
              <a href="/publico/consulta" className="flex items-center gap-1 hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">search</span>
                Consultar mi turno
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
