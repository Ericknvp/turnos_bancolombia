import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { categoriasApi, serviciosApi, turnosApi, ApiException } from "../api/client";
import type { Categoria, Servicio, Turno } from "../api/types";
import { BrandMark } from "../components/BrandMark";
import { useAuth } from "../auth/AuthContext";

const ICONOS_SERVICIO: Record<string, string> = {
  CAJ: "point_of_sale",
  ASE: "handshake",
};

const ICONOS_CATEGORIA: Record<string, string> = {
  Regular: "person",
  "Adulto mayor": "elderly",
  Embarazada: "pregnant_woman",
  Discapacidad: "accessible",
};

export default function RegistrarTurnoPage() {
  const { sesion } = useAuth();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [nombreCliente, setNombreCliente] = useState("");
  const [turnoGenerado, setTurnoGenerado] = useState<Turno | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    serviciosApi.listar().then((lista) => setServicios(lista.filter((s) => s.activo)));
    categoriasApi.listar().then(setCategorias);
  }, []);

  async function registrar() {
    if (!servicioId || !categoriaId || !nombreCliente.trim()) return;
    setError(null);
    setCargando(true);
    try {
      const turno = await turnosApi.registrar({ servicioId, categoriaId, nombreCliente: nombreCliente.trim() });
      setTurnoGenerado(turno);
      setNombreCliente("");
      setServicioId(null);
      setCategoriaId(null);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "No se pudo registrar el turno");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-[#F4F5F7]">
      <header className="flex items-center justify-between px-margin h-16 border-b border-surface-container-high bg-surface-container-lowest">
        <div className="flex items-center gap-space-md">
          <BrandMark />
          <div className="h-6 w-px bg-surface-container-high mx-1" />
          <Link
            to="/operador"
            className="flex items-center gap-1 text-secondary hover:text-on-surface font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver a la consola
          </Link>
        </div>
        <span className="font-label-md text-label-md text-secondary">{sesion?.nombreCompleto}</span>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-margin grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <section className="md:col-span-7 bg-surface-container-lowest rounded-lg border border-surface-container-high shadow-sm p-space-lg flex flex-col gap-space-lg">
          <div>
            <h1 className="text-headline-md font-headline-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">confirmation_number</span>
              Registrar turno
            </h1>
            <p className="text-body-sm text-secondary mt-1">
              Paso 1: nombre o identificador del cliente. Paso 2: servicio. Paso 3: categoría.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-secondary uppercase tracking-wider">
              1. Identificación del cliente
            </label>
            <input
              className="w-full bg-surface border border-surface-container-high rounded p-3 text-body-lg text-on-surface focus:ring-2 focus:ring-primary-container focus:border-on-surface outline-none"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              placeholder="Nombre completo o documento"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-secondary uppercase tracking-wider">
              2. Seleccione el servicio
            </label>
            <div className="grid grid-cols-2 gap-3">
              {servicios.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServicioId(s.id)}
                  className={`flex flex-col items-start gap-1 p-4 rounded-lg border text-left transition-colors ${
                    servicioId === s.id
                      ? "border-on-surface bg-primary-container/30"
                      : "border-surface-container-high hover:border-outline"
                  }`}
                >
                  <span className="material-symbols-outlined text-[28px] text-tertiary">
                    {ICONOS_SERVICIO[s.prefijo] ?? "corporate_fare"}
                  </span>
                  <span className="font-title-md text-title-md font-bold text-on-surface">{s.nombre}</span>
                  <span className="text-body-sm text-secondary">{s.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-secondary uppercase tracking-wider">
              3. Categoría
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categorias.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoriaId(c.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                    categoriaId === c.id
                      ? "border-on-surface bg-primary-container/30"
                      : "border-surface-container-high hover:border-outline"
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px] text-[#2563EB]">
                    {ICONOS_CATEGORIA[c.nombre] ?? "person"}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface text-center">{c.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-50 border border-red-200 text-error font-label-md text-label-md">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={registrar}
            disabled={cargando || !servicioId || !categoriaId || !nombreCliente.trim()}
            className="flex items-center justify-center gap-2 bg-primary-container hover:bg-[#E6C700] text-on-surface font-title-md text-title-md font-bold px-5 py-3.5 rounded shadow-sm transition-all disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
            {cargando ? "Generando..." : "Generar Turno"}
          </button>
        </section>

        <aside className="md:col-span-5 bg-[#1C1C1C] text-surface-container-lowest rounded-lg p-space-lg flex flex-col items-center justify-center gap-space-md min-h-[320px]">
          {turnoGenerado ? (
            <>
              <span className="font-label-md text-label-md text-secondary-fixed uppercase tracking-wider">
                Turno asignado
              </span>
              <span className="font-display-turn-kiosk text-display-turn-kiosk text-primary-container tracking-tight">
                {turnoGenerado.codigo}
              </span>
              <span className="font-title-md text-title-md text-surface-container-lowest">
                {turnoGenerado.categoria.nombre} · {turnoGenerado.servicio.nombre}
              </span>
              <span className="text-body-sm text-secondary-fixed text-center">
                Espere a ser llamado por pantalla o altavoz. Conserve este código.
              </span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[48px] text-primary-container">receipt_long</span>
              <span className="text-body-md text-secondary-fixed text-center">
                Aquí verás el código del turno apenas lo generes
              </span>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
