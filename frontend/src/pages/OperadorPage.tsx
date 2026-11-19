import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiException, modulosApi, publicoApi, turnosApi } from "../api/client";
import type { AccionTurno, Modulo, Turno, TurnoPublico } from "../api/types";
import { BrandMark } from "../components/BrandMark";
import { useAuth } from "../auth/AuthContext";

const MODULO_KEY = "turnos_bancolombia_modulo_operador";

function RelojTexto() {
  const [ahora, setAhora] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <>{ahora.toLocaleTimeString("es-CO", { hour12: true })}</>;
}

function minutosDesde(fechaIso: string | null) {
  if (!fechaIso) return 0;
  const diffMs = Date.now() - new Date(fechaIso).getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
}

export default function OperadorPage() {
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [moduloId, setModuloId] = useState<number | null>(() => {
    const guardado = localStorage.getItem(MODULO_KEY);
    return guardado ? Number(guardado) : null;
  });

  const [turnoActual, setTurnoActual] = useState<Turno | null>(null);
  const [cola, setCola] = useState<Turno[]>([]);
  const [pantallaActual, setPantallaActual] = useState<TurnoPublico | null>(null);
  const [filtroCola, setFiltroCola] = useState<"todos" | "preferente" | "regular">("todos");

  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ accion: AccionTurno; turnoId: number } | null>(null);
  const [motivo, setMotivo] = useState("");

  const modulo = useMemo(() => modulos.find((m) => m.id === moduloId) ?? null, [modulos, moduloId]);

  useEffect(() => {
    modulosApi.listar().then((lista) => {
      const activos = lista.filter((m) => m.activo);
      setModulos(activos);
      if (!moduloId && activos.length > 0) {
        setModuloId(activos[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (moduloId) localStorage.setItem(MODULO_KEY, String(moduloId));
  }, [moduloId]);

  const refrescar = useCallback(async () => {
    if (!modulo) return;
    try {
      const [llamados, enAtencion, enEspera, pantalla] = await Promise.all([
        turnosApi.buscar({ estado: "LLAMADO", size: 100 }),
        turnosApi.buscar({ estado: "EN_ATENCION", size: 100 }),
        turnosApi.buscar({ servicioId: modulo.servicio.id, estado: "EN_ESPERA", size: 100 }),
        publicoApi.pantalla(),
      ]);
      const activo = [...llamados.content, ...enAtencion.content].find((t) => t.modulo?.id === modulo.id) ?? null;
      setTurnoActual(activo);
      setCola([...enEspera.content].sort((a, b) => a.fechaIngreso.localeCompare(b.fechaIngreso)));
      setPantallaActual(pantalla[0] ?? null);
    } catch {
      // silencioso: no interrumpir la consola por un refresco fallido
    }
  }, [modulo]);

  useEffect(() => {
    refrescar();
    const id = setInterval(refrescar, 5000);
    return () => clearInterval(id);
  }, [refrescar]);

  async function llamarSiguiente() {
    if (!modulo) return;
    setError(null);
    setAccionEnCurso("llamar");
    try {
      await modulosApi.llamarSiguiente(modulo.id);
      await refrescar();
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "No se pudo llamar el siguiente turno");
    } finally {
      setAccionEnCurso(null);
    }
  }

  async function ejecutarCambioEstado(accion: AccionTurno, turnoId: number, motivoTexto?: string) {
    setError(null);
    setAccionEnCurso(accion);
    try {
      await turnosApi.cambiarEstado(turnoId, accion, motivoTexto);
      await refrescar();
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "No se pudo aplicar la acción");
    } finally {
      setAccionEnCurso(null);
      setModal(null);
      setMotivo("");
    }
  }

  function abrirModalMotivo(accion: AccionTurno, turnoId: number) {
    setModal({ accion, turnoId });
    setMotivo("");
  }

  const colaFiltrada = cola.filter((t) => {
    if (filtroCola === "preferente") return t.categoria.esPreferente;
    if (filtroCola === "regular") return !t.categoria.esPreferente;
    return true;
  });
  const totalPreferentes = cola.filter((t) => t.categoria.esPreferente).length;
  const totalRegulares = cola.length - totalPreferentes;
  const esperaPromedioCola = cola.length
    ? Math.round(cola.reduce((acc, t) => acc + minutosDesde(t.fechaIngreso), 0) / cola.length)
    : 0;

  function onLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="h-full flex flex-col font-body-md text-body-md text-on-surface bg-[#F4F5F7]">
      <header className="flex justify-between items-center w-full px-margin h-16 border-b border-surface-container-high bg-surface-container-lowest z-30 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-space-md">
          <BrandMark />
          <div className="h-6 w-px bg-surface-container-high mx-1" />
          <select
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-surface-container-low text-on-surface border border-surface-container-high font-label-md text-label-md"
            value={moduloId ?? ""}
            onChange={(e) => setModuloId(Number(e.target.value))}
          >
            {modulos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.codigo} · {m.nombre}
              </option>
            ))}
          </select>
          {turnoActual && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-label-md text-label-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {turnoActual.estado === "EN_ATENCION" ? "En atención" : "Llamado"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-space-lg">
          <nav className="hidden xl:flex items-center gap-6">
            <Link className="text-secondary font-label-md text-label-md hover:text-on-surface" to="/operador/registrar">
              Registrar turno
            </Link>
          </nav>
          <div className="flex items-center gap-2 bg-[#F4F5F7] px-3 py-1.5 rounded border border-surface-container-high text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-secondary">schedule</span>
            <span className="font-label-lg text-label-lg font-bold tracking-tight">
              <RelojTexto />
            </span>
          </div>
          <div className="flex items-center gap-2.5 pl-2 border-l border-surface-container-high">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-surface flex items-center justify-center font-title-md font-bold text-sm">
              {sesion?.nombreCompleto
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">
                {sesion?.nombreCompleto}
              </span>
              <button onClick={onLogout} className="font-body-sm text-body-sm text-secondary hover:text-error text-left">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-surface-container-lowest border-b border-surface-container-high px-margin py-2 flex items-center justify-between text-body-sm text-secondary flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>
            Espera promedio de la fila: <strong className="text-on-surface">{esperaPromedioCola} min</strong>
          </span>
          <span className="text-surface-dim">|</span>
          <span>
            En fila ahora: <strong className="text-on-surface">{cola.length}</strong>
          </span>
        </div>
        {error && (
          <span className="flex items-center gap-1 text-error font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
          </span>
        )}
      </div>

      <main className="flex-1 w-full max-w-[1920px] mx-auto p-margin grid grid-cols-12 gap-gutter overflow-hidden">
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-space-md h-full overflow-y-auto pr-1">
          <div className="bg-surface-container-lowest rounded-lg border border-surface-container-high shadow-sm relative overflow-hidden flex flex-col">
            <div className="h-1.5 w-full bg-primary-container" />
            {turnoActual ? (
              <>
                <div className="p-space-lg pb-space-sm flex flex-wrap items-center justify-between gap-4 border-b border-surface-container-low">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-primary-container text-on-surface font-label-lg text-label-lg tracking-wide uppercase">
                      <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
                      {turnoActual.estado === "EN_ATENCION" ? "Turno en atención" : "Turno llamado"}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      Llamado a las{" "}
                      {turnoActual.fechaLlamado &&
                        new Date(turnoActual.fechaLlamado).toLocaleTimeString("es-CO", { hour12: true })}
                    </span>
                  </div>
                  {turnoActual.categoria.esPreferente && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-label-md text-label-md font-bold">
                      <span className="material-symbols-outlined text-[18px]">accessible</span>
                      Preferente · {turnoActual.categoria.nombre}
                    </div>
                  )}
                </div>

                <div className="p-space-lg grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5 flex flex-col justify-center bg-surface-container-low p-space-md rounded-lg border border-surface-container-high">
                    <div className="flex items-center justify-between text-secondary font-label-md text-label-md mb-1">
                      <span>CÓDIGO DE IDENTIFICACIÓN</span>
                      <span className="material-symbols-outlined text-[18px] text-primary">confirmation_number</span>
                    </div>
                    <div className="font-token-ticket text-token-ticket text-on-surface tracking-tight">
                      {turnoActual.codigo}
                    </div>
                  </div>
                  <div className="md:col-span-7 flex flex-col justify-between h-full space-y-3">
                    <div className="border-b border-surface-container-low pb-2">
                      <span className="block font-label-md text-label-md text-secondary uppercase tracking-wider mb-0.5">
                        Cliente
                      </span>
                      <span className="font-title-md text-title-md text-on-surface font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-secondary">person</span>
                        {turnoActual.nombreCliente}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-space-lg py-space-md bg-[#FFFDF0] border-y border-surface-container-high flex items-center gap-4">
                  <span className="material-symbols-outlined text-[24px] text-primary">timer</span>
                  <div>
                    <span className="block font-label-md text-label-md text-secondary">TIEMPO EN ESTE ESTADO</span>
                    <span className="font-headline-md text-headline-md font-extrabold text-on-surface tabular-nums">
                      {minutosDesde(turnoActual.estado === "EN_ATENCION" ? turnoActual.fechaInicioAtencion : turnoActual.fechaLlamado)}{" "}
                      min
                    </span>
                  </div>
                </div>

                <div className="p-space-lg bg-surface-container-lowest flex flex-wrap items-center gap-3">
                  {turnoActual.estado === "LLAMADO" && (
                    <button
                      onClick={() => ejecutarCambioEstado("INICIAR", turnoActual.id)}
                      disabled={accionEnCurso !== null}
                      className="flex items-center gap-2 bg-surface-container-lowest hover:bg-emerald-50 text-emerald-800 border border-emerald-600 font-label-lg text-label-lg px-4 py-2.5 rounded transition-colors shadow-sm disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                      Iniciar atención
                    </button>
                  )}
                  {turnoActual.estado === "EN_ATENCION" && (
                    <button
                      onClick={() => ejecutarCambioEstado("FINALIZAR", turnoActual.id)}
                      disabled={accionEnCurso !== null}
                      className="flex items-center gap-2 bg-on-background hover:bg-inverse-surface text-surface-container-lowest font-label-lg text-label-lg font-semibold px-4 py-2.5 rounded transition-colors shadow-sm disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      Finalizar atención
                    </button>
                  )}
                  {turnoActual.estado === "LLAMADO" && (
                    <button
                      onClick={() => abrirModalMotivo("MARCAR_AUSENTE", turnoActual.id)}
                      disabled={accionEnCurso !== null}
                      className="flex items-center gap-1.5 bg-surface-container-lowest hover:bg-amber-50 text-amber-800 border border-amber-500 font-label-md text-label-md px-3 py-2 rounded transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_off</span>
                      Marcar ausente
                    </button>
                  )}
                  <button
                    onClick={() => abrirModalMotivo("CANCELAR", turnoActual.id)}
                    disabled={accionEnCurso !== null}
                    className="flex items-center gap-1.5 bg-surface-container-lowest hover:bg-red-50 text-error border border-error font-label-md text-label-md px-3 py-2 rounded transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Cancelar turno
                  </button>
                </div>
              </>
            ) : (
              <div className="p-space-2xl flex flex-col items-center justify-center gap-3 text-center">
                <span className="material-symbols-outlined text-[48px] text-secondary">inbox</span>
                <p className="text-body-lg text-secondary">Este módulo no tiene un turno activo.</p>
                <button
                  onClick={llamarSiguiente}
                  disabled={accionEnCurso !== null || !modulo}
                  className="flex items-center gap-2 bg-primary-container hover:bg-[#E6C700] text-on-surface font-title-md text-title-md font-bold px-5 py-2.5 rounded shadow-sm transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[22px]">campaign</span>
                  {accionEnCurso === "llamar" ? "Llamando..." : "Llamar siguiente turno"}
                </button>
              </div>
            )}
          </div>

          {turnoActual && (
            <div className="flex justify-end">
              <button
                onClick={llamarSiguiente}
                disabled={accionEnCurso !== null}
                className="flex items-center gap-2 bg-surface-container-lowest border border-surface-container-high hover:bg-surface-container-low text-on-surface font-label-lg text-label-lg font-semibold px-4 py-2 rounded transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">campaign</span>
                Resolver y llamar otro
              </button>
            </div>
          )}

          <div className="bg-[#1C1C1C] text-surface-container-lowest rounded-lg p-space-md flex items-center justify-between border border-surface-container-high">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded bg-surface-container-lowest/10 text-primary-container">
                <span className="material-symbols-outlined text-[28px]">tv</span>
              </div>
              <div>
                <div className="font-label-md text-label-md text-secondary-fixed uppercase tracking-wider">
                  Transmisión en pantalla de sala
                </div>
                <div className="text-title-md font-bold text-primary-container flex items-center gap-2">
                  {pantallaActual ? (
                    <>
                      {pantallaActual.codigo}{" "}
                      <span className="text-surface-container-lowest text-body-md font-normal">
                        → {pantallaActual.modulo}
                      </span>
                    </>
                  ) : (
                    "Sin llamados activos"
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-4 flex flex-col h-full bg-surface-container-lowest rounded-lg border border-surface-container-high shadow-sm overflow-hidden">
          <div className="p-space-md border-b border-surface-container-high bg-surface-container-lowest flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">queue</span>
                Fila de espera
              </h2>
              <span className="text-body-sm text-secondary">{modulo?.servicio.nombre}</span>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-container text-on-surface font-label-lg text-label-lg font-bold">
              {cola.length} en espera
            </span>
          </div>

          <div className="px-space-md pt-2 pb-1 border-b border-surface-container-low bg-[#FAFBFD] flex items-center gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setFiltroCola("todos")}
              className={`px-3 py-1.5 rounded font-label-md text-label-md ${
                filtroCola === "todos" ? "bg-on-background text-surface-container-lowest font-semibold" : "text-secondary hover:bg-surface-container"
              }`}
            >
              Todos ({cola.length})
            </button>
            <button
              onClick={() => setFiltroCola("preferente")}
              className={`px-3 py-1.5 rounded font-label-md text-label-md ${
                filtroCola === "preferente" ? "bg-on-background text-surface-container-lowest font-semibold" : "text-secondary hover:bg-surface-container"
              }`}
            >
              Preferente ({totalPreferentes})
            </button>
            <button
              onClick={() => setFiltroCola("regular")}
              className={`px-3 py-1.5 rounded font-label-md text-label-md ${
                filtroCola === "regular" ? "bg-on-background text-surface-container-lowest font-semibold" : "text-secondary hover:bg-surface-container"
              }`}
            >
              Regular ({totalRegulares})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-space-md space-y-2.5 custom-scroll bg-[#F8F9FF]/60">
            {colaFiltrada.length === 0 && (
              <p className="text-body-sm text-secondary text-center py-6">No hay turnos en este filtro.</p>
            )}
            {colaFiltrada.map((t) => {
              const espera = minutosDesde(t.fechaIngreso);
              const envejecido = !t.categoria.esPreferente && espera >= 15;
              return (
                <div
                  key={t.id}
                  className={`p-3 bg-surface-container-lowest rounded border border-surface-container-high border-l-4 shadow-xs flex flex-col gap-2 ${
                    envejecido ? "border-l-red-500" : t.categoria.esPreferente ? "border-l-[#2563EB]" : "border-l-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-title-md font-bold text-on-surface tracking-tight">
                      {t.codigo}
                    </span>
                    {envejecido && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 border border-red-200 text-error font-label-md text-label-md font-bold">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        Envejecido
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-secondary">
                    <span className={t.categoria.esPreferente ? "text-[#2563EB] font-semibold" : ""}>
                      {t.categoria.nombre}
                    </span>
                    <span className="font-label-md text-label-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      Espera: {espera} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-surface-container-low text-xs text-secondary">
                    <span>Cliente: {t.nombreCliente}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-space-md bg-surface-container border-t border-surface-container-high flex items-center justify-between">
            <span className="font-label-md text-label-md text-secondary">Espera promedio de la fila:</span>
            <span className="font-title-md text-title-md font-bold text-on-surface">{esperaPromedioCola} min</span>
          </div>
        </aside>
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-6 border border-surface-container-high shadow-xl">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
              {modal.accion === "CANCELAR" ? "Cancelar turno" : "Marcar turno ausente"}
            </h3>
            <p className="font-body-sm text-body-sm text-secondary mb-3">
              Indica el motivo, es obligatorio para dejar trazabilidad en el historial.
            </p>
            <textarea
              className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none mb-4"
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: el cliente se retiró / no se presentó al módulo"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-secondary font-label-lg text-label-lg hover:text-on-surface"
              >
                Cerrar
              </button>
              <button
                onClick={() => ejecutarCambioEstado(modal.accion, modal.turnoId, motivo)}
                disabled={!motivo.trim() || accionEnCurso !== null}
                className="px-5 py-2 rounded bg-error text-on-error font-title-md text-title-md font-semibold disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
