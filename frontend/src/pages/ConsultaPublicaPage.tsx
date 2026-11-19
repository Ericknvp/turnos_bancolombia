import { useState } from "react";
import { ApiException, publicoApi } from "../api/client";
import type { ConsultaTurnoPublico } from "../api/types";

const ETIQUETA_ESTADO: Record<string, string> = {
  EN_ESPERA: "En espera en sala",
  LLAMADO: "¡Llamado a módulo!",
  EN_ATENCION: "En atención",
  FINALIZADO: "Atención finalizada",
  CANCELADO: "Turno cancelado",
  AUSENTE: "Marcado como ausente",
};

export default function ConsultaPublicaPage() {
  const [codigo, setCodigo] = useState("");
  const [turno, setTurno] = useState<ConsultaTurnoPublico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);

  async function buscar() {
    if (!codigo.trim()) return;
    setError(null);
    setCargando(true);
    try {
      const resultado = await publicoApi.consultarTurno(codigo.trim());
      setTurno(resultado);
    } catch (err) {
      setTurno(null);
      setError(err instanceof ApiException ? err.message : "No se pudo consultar el turno");
    } finally {
      setCargando(false);
    }
  }

  const etapa = turno
    ? turno.estado === "EN_ESPERA"
      ? 2
      : turno.estado === "LLAMADO"
        ? 3
        : turno.estado === "EN_ATENCION" || turno.estado === "FINALIZADO"
          ? 4
          : 2
    : 0;

  return (
    <div className="min-h-full flex flex-col bg-[#F4F5F7]">
      <header className="bg-surface-container-lowest border-b border-surface-container-high sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center border border-surface-container-high shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 14C4 8.47715 8.47715 4 14 4H18C23.5228 4 28 8.47715 28 14V18C28 23.5228 23.5228 28 18 28H14C8.47715 28 4 23.5228 4 18V14Z"
                  fill="#0B1C30"
                />
                <path d="M10 18L16 10L22 18H10Z" fill="#FFDD00" />
                <path d="M12 21H20" stroke="#FFDD00" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface block leading-tight">
                Bancolombia
              </span>
              <span className="font-label-md text-label-md text-secondary block -mt-0.5">
                Seguimiento de Turnos en Línea
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-high text-on-surface">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-label-md text-label-md font-medium">Sede Central</span>
            <span className="text-xs text-secondary">• Sala Conectada</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10">
        <section className="bg-surface-container-lowest rounded-xl border border-surface-container-high shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block font-label-lg text-label-lg text-on-surface mb-1.5">
                Ingresa el código de tu turno
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-surface-container-high rounded-lg text-on-surface font-title-md text-title-md placeholder:text-secondary placeholder:font-normal focus:bg-surface-container-lowest focus:border-on-surface focus:ring-1 focus:ring-on-surface transition-all outline-none"
                  placeholder="Ej: CAJ-20261118-004"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && buscar()}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={buscar}
              disabled={cargando}
              className="h-11 px-6 bg-primary-container text-on-primary-fixed font-title-md text-title-md font-semibold rounded-lg hover:bg-primary-fixed active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">sync</span>
              {cargando ? "Consultando..." : "Consultar Turno"}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-secondary px-1">
            <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
            Consulta pública: no se muestra ningún dato personal del cliente.
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-error font-label-md text-label-md mb-6">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        {turno && (
          <article className="bg-surface-container-lowest rounded-xl border border-surface-container-high shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 bg-surface-container-low border-b border-surface-container-high flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">confirmation_number</span>
              <span className="font-label-lg text-label-lg uppercase tracking-wider text-secondary">
                Estado de tu turno
              </span>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-surface-container-high">
                <div>
                  <h1 className="font-token-ticket text-token-ticket sm:text-[44px] text-on-surface tracking-tight font-extrabold tabular-nums">
                    {turno.codigo}
                  </h1>
                  <p className="font-title-md text-title-md text-secondary flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">
                      account_balance_wallet
                    </span>
                    {turno.categoria} · {turno.servicio}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end justify-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                      turno.estado === "LLAMADO"
                        ? "bg-tertiary text-on-tertiary border-transparent shadow-md animate-bounce"
                        : turno.estado === "EN_ATENCION"
                          ? "bg-emerald-600 text-white border-transparent"
                          : turno.estado === "EN_ESPERA"
                            ? "bg-primary-container text-on-primary-fixed border-primary-fixed-dim"
                            : "bg-surface-container text-secondary border-surface-container-high"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {turno.estado === "LLAMADO" ? "notifications_active" : "radio_button_checked"}
                    </span>
                    <span className="font-title-md text-title-md font-bold uppercase tracking-wide">
                      {ETIQUETA_ESTADO[turno.estado] ?? turno.estado}
                    </span>
                  </div>
                </div>
              </div>

              {turno.estado === "LLAMADO" && (
                <div className="mt-6 p-4 rounded-lg bg-tertiary-container border border-tertiary text-on-tertiary-fixed">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary text-[28px]">campaign</span>
                    <div>
                      <h2 className="font-title-md text-title-md font-bold text-on-tertiary-fixed">
                        ¡Es tu turno de ser atendido!
                      </h2>
                      <p className="font-body-md text-body-md mt-0.5 text-on-tertiary-fixed-variant">
                        Por favor dirígete a{" "}
                        <strong className="text-on-tertiary-fixed font-bold underline">{turno.modulo}</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {turno.estado === "EN_ESPERA" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                  <div className="p-4 rounded-lg bg-surface-container-low border border-surface-container-high">
                    <div className="flex items-center justify-between text-secondary mb-2">
                      <span className="font-label-md text-label-md uppercase tracking-wider">Tiempo estimado</span>
                      <span className="material-symbols-outlined text-[20px] text-primary">timer</span>
                    </div>
                    <div className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                      ~{turno.tiempoEstimadoMinutos} min
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-container-low border border-surface-container-high">
                    <div className="flex items-center justify-between text-secondary mb-2">
                      <span className="font-label-md text-label-md uppercase tracking-wider">
                        Turnos antes del tuyo
                      </span>
                      <span className="material-symbols-outlined text-[20px] text-tertiary">groups</span>
                    </div>
                    <div className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                      {turno.posicionEnFila} {turno.posicionEnFila === 1 ? "persona" : "personas"}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-container-low border border-surface-container-high">
                    <div className="flex items-center justify-between text-secondary mb-2">
                      <span className="font-label-md text-label-md uppercase tracking-wider">Prioridad</span>
                      <span className="material-symbols-outlined text-[20px] text-secondary">desktop_windows</span>
                    </div>
                    <div className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                      {turno.esPreferente ? "Preferente" : "Regular"}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 pb-2">
                <h2 className="font-label-lg text-label-lg text-on-surface mb-5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">route</span>
                  Progreso de atención
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2">
                  {[
                    { n: 1, icono: "check", titulo: "Turno emitido" },
                    { n: 2, icono: "hourglass_top", titulo: "En espera en sala" },
                    { n: 3, icono: "notifications", titulo: "Llamado a ventanilla" },
                    { n: 4, icono: "task_alt", titulo: "Atención finalizada" },
                  ].map((paso) => {
                    const completado = paso.n < etapa;
                    const activo = paso.n === etapa;
                    return (
                      <div key={paso.n} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                            completado
                              ? "bg-emerald-600 text-white"
                              : activo
                                ? "bg-primary-container text-on-primary-fixed border-2 border-on-surface"
                                : "bg-surface-container text-secondary border border-surface-container-high"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {completado ? "check" : paso.icono}
                          </span>
                        </div>
                        <h3
                          className={`font-title-md text-title-md ${
                            activo ? "font-bold text-on-surface" : "font-medium text-secondary"
                          }`}
                        >
                          {paso.titulo}
                        </h3>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface-container-lowest border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setMostrarAviso(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-surface-container-high bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors font-title-md text-title-md font-semibold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">chat</span>
                Recibir notificación por SMS / WhatsApp
              </button>
              <button
                type="button"
                disabled
                title="Por seguridad, la cancelación de turnos solo puede hacerla un operador en la sucursal"
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-surface-container-high text-secondary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Cancelar mi turno
              </button>
            </div>
          </article>
        )}

        {mostrarAviso && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setMostrarAviso(false)}>
            <div
              className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-6 border border-surface-container-high shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
                Función en construcción
              </h3>
              <p className="font-body-md text-body-md text-secondary mb-4">
                Las notificaciones por SMS/WhatsApp no están disponibles todavía en esta versión de demostración.
              </p>
              <button
                type="button"
                onClick={() => setMostrarAviso(false)}
                className="w-full px-4 py-2 rounded bg-primary-container text-on-primary-fixed font-title-md text-title-md font-semibold"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-surface-container-lowest border-t border-surface-container-high py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-xs text-secondary">
          <p>© 2026 Grupo Bancolombia. Todos los derechos reservados. Vigilado Superintendencia Financiera de Colombia.</p>
          <p className="font-mono mt-1">Proyecto académico — Cliente Servidor, Sistema de Turnos con Prioridades</p>
        </div>
      </footer>
    </div>
  );
}
