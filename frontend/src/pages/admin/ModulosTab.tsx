import { useEffect, useState } from "react";
import { ApiException, modulosApi, serviciosApi } from "../../api/client";
import type { Modulo, Servicio } from "../../api/types";
import { Modal } from "../../components/Modal";

export default function ModulosTab() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [editando, setEditando] = useState<Modulo | null>(null);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState({ codigo: "", nombre: "", servicioId: 0 });
  const [error, setError] = useState<string | null>(null);

  function cargar() {
    modulosApi.listar().then(setModulos);
    serviciosApi.listar().then(setServicios);
  }

  useEffect(cargar, []);

  function abrirCrear() {
    setForm({ codigo: "", nombre: "", servicioId: servicios[0]?.id ?? 0 });
    setError(null);
    setCreando(true);
  }

  function abrirEditar(m: Modulo) {
    setForm({ codigo: m.codigo, nombre: m.nombre, servicioId: m.servicio.id });
    setError(null);
    setEditando(m);
  }

  async function guardar() {
    setError(null);
    try {
      if (editando) {
        await modulosApi.actualizar(editando.id, { ...form, activo: editando.activo });
      } else {
        await modulosApi.crear(form);
      }
      setEditando(null);
      setCreando(false);
      cargar();
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "No se pudo guardar el módulo");
    }
  }

  async function alternarActivo(m: Modulo) {
    await (m.activo ? modulosApi.desactivar(m.id) : modulosApi.activar(m.id));
    cargar();
  }

  const modalAbierto = creando || editando !== null;

  return (
    <section className="bg-surface-container-lowest rounded-lg border border-surface-container-high shadow-sm overflow-hidden flex flex-col">
      <div className="p-space-md border-b border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold tracking-tight">
            Módulos de atención
          </h2>
          <p className="text-body-sm font-body-sm text-secondary mt-0.5">Ventanillas físicas asociadas a un servicio</p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center justify-center gap-space-xs px-4 py-2.5 bg-primary-container hover:bg-[#E6C700] text-[#1C1C1C] rounded-lg font-label-lg text-label-lg font-semibold shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo módulo
        </button>
      </div>

      <div className="overflow-x-auto custom-scroll">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-surface-container-high text-secondary text-label-md font-label-md">
              <th className="py-3 px-4 font-semibold">Código</th>
              <th className="py-3 px-4 font-semibold">Nombre</th>
              <th className="py-3 px-4 font-semibold">Servicio</th>
              <th className="py-3 px-4 font-semibold">Estado</th>
              <th className="py-3 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high text-body-sm font-body-sm text-on-surface">
            {modulos.map((m) => (
              <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                <td className="py-3.5 px-4 font-mono font-semibold">{m.codigo}</td>
                <td className="py-3.5 px-4 font-semibold">{m.nombre}</td>
                <td className="py-3.5 px-4 text-secondary">{m.servicio.nombre}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-body-sm font-semibold ${
                      m.activo ? "bg-emerald-100 text-emerald-800" : "bg-surface-container-high text-secondary"
                    }`}
                  >
                    {m.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button onClick={() => abrirEditar(m)} className="text-secondary hover:text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => alternarActivo(m)} className="text-secondary hover:text-error">
                    <span className="material-symbols-outlined text-[18px]">
                      {m.activo ? "toggle_off" : "toggle_on"}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title={editando ? "Editar módulo" : "Nuevo módulo"} onClose={() => { setCreando(false); setEditando(null); }}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-label-md font-label-md text-secondary mb-1">Código (ej: M01)</label>
              <input
                className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-secondary mb-1">Nombre</label>
              <input
                className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-secondary mb-1">Servicio</label>
              <select
                className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none"
                value={form.servicioId}
                onChange={(e) => setForm({ ...form, servicioId: Number(e.target.value) })}
              >
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-error text-body-sm">{error}</p>}
            <button
              onClick={guardar}
              className="mt-2 px-5 py-2.5 rounded bg-primary-container text-on-primary-fixed font-title-md text-title-md font-semibold"
            >
              Guardar
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
