import { useEffect, useState } from "react";
import { historialApi, serviciosApi } from "../../api/client";
import type { EstadoTurno, HistorialTurno, Indicadores, Servicio } from "../../api/types";

const ESTADOS: EstadoTurno[] = ["EN_ESPERA", "LLAMADO", "EN_ATENCION", "FINALIZADO", "CANCELADO", "AUSENTE"];

export default function HistorialTab() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioId, setServicioId] = useState<number | "">("");
  const [estado, setEstado] = useState<EstadoTurno | "">("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [historial, setHistorial] = useState<HistorialTurno[]>([]);
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);

  useEffect(() => {
    serviciosApi.listar().then(setServicios);
  }, []);

  async function buscar() {
    const filtroServicio = servicioId === "" ? undefined : servicioId;
    const [hist, ind] = await Promise.all([
      historialApi.buscar({
        servicioId: filtroServicio,
        estado: estado || undefined,
        desde: desde ? `${desde}T00:00:00` : undefined,
        hasta: hasta ? `${hasta}T23:59:59` : undefined,
        size: 50,
      }),
      historialApi.indicadores({ servicioId: filtroServicio, desde: desde || undefined, hasta: hasta || undefined }),
    ]);
    setHistorial(hist.content);
    setIndicadores(ind);
  }

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-space-lg">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {[
          { label: "Turnos emitidos", valor: indicadores?.turnosEmitidos, icono: "confirmation_number" },
          { label: "Finalizados", valor: indicadores?.finalizados, icono: "task_alt" },
          { label: "Cancelados / Ausentes", valor: (indicadores?.cancelados ?? 0) + (indicadores?.ausentes ?? 0), icono: "cancel" },
          {
            label: "Espera promedio",
            valor: indicadores ? `${indicadores.promedioEsperaMinutos.toFixed(0)} min` : undefined,
            icono: "schedule",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-container-lowest p-space-md rounded-lg border border-surface-container-high shadow-sm"
          >
            <div className="flex items-center justify-between text-secondary">
              <span className="text-body-sm font-body-sm">{kpi.label}</span>
              <span className="material-symbols-outlined text-secondary">{kpi.icono}</span>
            </div>
            <div className="mt-2 text-token-ticket font-token-ticket text-on-surface tracking-tight">
              {kpi.valor ?? "—"}
            </div>
          </div>
        ))}
      </section>

      <section className="bg-surface-container-lowest rounded-lg border border-surface-container-high shadow-sm overflow-hidden flex flex-col">
        <div className="p-space-md border-b border-surface-container-high bg-[#F8F9FF] grid grid-cols-1 md:grid-cols-12 gap-space-sm items-end">
          <div className="md:col-span-3">
            <label className="block text-xs text-secondary mb-1">Servicio</label>
            <select
              className="w-full border border-surface-container-high rounded-lg px-3 py-2 text-body-sm"
              value={servicioId}
              onChange={(e) => setServicioId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Todos</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-secondary mb-1">Estado</label>
            <select
              className="w-full border border-surface-container-high rounded-lg px-3 py-2 text-body-sm"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoTurno | "")}
            >
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-secondary mb-1">Desde</label>
            <input
              type="date"
              className="w-full border border-surface-container-high rounded-lg px-3 py-2 text-body-sm"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-secondary mb-1">Hasta</label>
            <input
              type="date"
              className="w-full border border-surface-container-high rounded-lg px-3 py-2 text-body-sm"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={buscar}
              className="w-full px-4 py-2 bg-primary-container hover:bg-[#E6C700] text-[#1C1C1C] rounded-lg font-label-lg text-label-lg font-semibold"
            >
              Filtrar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-high text-secondary text-label-md font-label-md">
                <th className="py-3 px-4 font-semibold">Código</th>
                <th className="py-3 px-4 font-semibold">Servicio</th>
                <th className="py-3 px-4 font-semibold">Estado anterior</th>
                <th className="py-3 px-4 font-semibold">Estado nuevo</th>
                <th className="py-3 px-4 font-semibold">Fecha</th>
                <th className="py-3 px-4 font-semibold">Operador</th>
                <th className="py-3 px-4 font-semibold">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-body-sm font-body-sm text-on-surface">
              {historial.map((h) => (
                <tr key={h.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-4 font-mono">{h.turno.codigo}</td>
                  <td className="py-3 px-4 text-secondary">{h.turno.servicio.nombre}</td>
                  <td className="py-3 px-4 text-secondary">{h.estadoAnterior ?? "—"}</td>
                  <td className="py-3 px-4 font-semibold">{h.estadoNuevo}</td>
                  <td className="py-3 px-4 text-secondary">{new Date(h.fecha).toLocaleString("es-CO")}</td>
                  <td className="py-3 px-4 text-secondary">{h.operador?.nombreCompleto ?? "—"}</td>
                  <td className="py-3 px-4 text-secondary">{h.motivo ?? "—"}</td>
                </tr>
              ))}
              {historial.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-secondary">
                    Sin resultados para los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
