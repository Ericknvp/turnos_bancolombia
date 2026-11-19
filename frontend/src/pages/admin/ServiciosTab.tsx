import { useEffect, useState } from "react";
import { ApiException, serviciosApi } from "../../api/client";
import type { Servicio } from "../../api/types";
import { Modal } from "../../components/Modal";

const VACIO = { nombre: "", prefijo: "", descripcion: "" };

export default function ServiciosTab() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [editando, setEditando] = useState<Servicio | null>(null);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState<string | null>(null);

  function cargar() {
    serviciosApi.listar().then(setServicios);
  }

  useEffect(cargar, []);

  function abrirCrear() {
    setForm(VACIO);
    setError(null);
    setCreando(true);
  }

  function abrirEditar(s: Servicio) {
    setForm({ nombre: s.nombre, prefijo: s.prefijo, descripcion: s.descripcion });
    setError(null);
    setEditando(s);
  }

  async function guardar() {
    setError(null);
    try {
      if (editando) {
        await serviciosApi.actualizar(editando.id, { ...form, activo: editando.activo });
      } else {
        await serviciosApi.crear(form);
      }
      setEditando(null);
      setCreando(false);
      cargar();
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "No se pudo guardar el servicio");
    }
  }

  async function alternarActivo(s: Servicio) {
    await (s.activo ? serviciosApi.desactivar(s.id) : serviciosApi.activar(s.id));
    cargar();
  }

  const modalAbierto = creando || editando !== null;

  return (
    <section className="bg-surface-container-lowest rounded-lg border border-surface-container-high shadow-sm overflow-hidden flex flex-col">
      <div className="p-space-md border-b border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold tracking-tight">Servicios</h2>
          <p className="text-body-sm font-body-sm text-secondary mt-0.5">
            Caja, Asesoría y demás servicios ofrecidos en la sucursal
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center justify-center gap-space-xs px-4 py-2.5 bg-primary-container hover:bg-[#E6C700] text-[#1C1C1C] rounded-lg font-label-lg text-label-lg font-semibold shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo servicio
        </button>
      </div>

      <div className="overflow-x-auto custom-scroll">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-surface-container-high text-secondary text-label-md font-label-md">
              <th className="py-3 px-4 font-semibold">Prefijo</th>
              <th className="py-3 px-4 font-semibold">Nombre</th>
              <th className="py-3 px-4 font-semibold">Descripción</th>
              <th className="py-3 px-4 font-semibold">Estado</th>
              <th className="py-3 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high text-body-sm font-body-sm text-on-surface">
            {servicios.map((s) => (
              <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                <td className="py-3.5 px-4 font-mono font-semibold">{s.prefijo}</td>
                <td className="py-3.5 px-4 font-semibold">{s.nombre}</td>
                <td className="py-3.5 px-4 text-secondary">{s.descripcion}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-body-sm font-semibold ${
                      s.activo ? "bg-emerald-100 text-emerald-800" : "bg-surface-container-high text-secondary"
                    }`}
                  >
                    {s.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button onClick={() => abrirEditar(s)} className="text-secondary hover:text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => alternarActivo(s)} className="text-secondary hover:text-error">
                    <span className="material-symbols-outlined text-[18px]">
                      {s.activo ? "toggle_off" : "toggle_on"}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title={editando ? "Editar servicio" : "Nuevo servicio"} onClose={() => { setCreando(false); setEditando(null); }}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-label-md font-label-md text-secondary mb-1">Nombre</label>
              <input
                className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-secondary mb-1">Prefijo (ej: CAJ)</label>
              <input
                className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none uppercase"
                value={form.prefijo}
                maxLength={10}
                onChange={(e) => setForm({ ...form, prefijo: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-secondary mb-1">Descripción</label>
              <textarea
                className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none"
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
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
