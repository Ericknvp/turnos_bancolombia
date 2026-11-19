import { useEffect, useState } from "react";
import { ApiException, categoriasApi } from "../../api/client";
import type { Categoria } from "../../api/types";
import { Modal } from "../../components/Modal";

export default function CategoriasTab() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState({ nombre: "", esPreferente: false });
  const [error, setError] = useState<string | null>(null);

  function cargar() {
    categoriasApi.listar().then(setCategorias);
  }

  useEffect(cargar, []);

  function abrirCrear() {
    setForm({ nombre: "", esPreferente: false });
    setError(null);
    setCreando(true);
  }

  function abrirEditar(c: Categoria) {
    setForm({ nombre: c.nombre, esPreferente: c.esPreferente });
    setError(null);
    setEditando(c);
  }

  async function guardar() {
    setError(null);
    try {
      if (editando) {
        await categoriasApi.actualizar(editando.id, form);
      } else {
        await categoriasApi.crear(form);
      }
      setEditando(null);
      setCreando(false);
      cargar();
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "No se pudo guardar la categoría");
    }
  }

  const modalAbierto = creando || editando !== null;

  return (
    <section className="bg-surface-container-lowest rounded-lg border border-surface-container-high shadow-sm overflow-hidden flex flex-col">
      <div className="p-space-md border-b border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold tracking-tight">Categorías</h2>
          <p className="text-body-sm font-body-sm text-secondary mt-0.5">
            Discapacidad, Embarazada y Adulto mayor forman el conjunto preferente; Regular es la única sin prioridad
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center justify-center gap-space-xs px-4 py-2.5 bg-primary-container hover:bg-[#E6C700] text-[#1C1C1C] rounded-lg font-label-lg text-label-lg font-semibold shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nueva categoría
        </button>
      </div>

      <div className="overflow-x-auto custom-scroll">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-surface-container-high text-secondary text-label-md font-label-md">
              <th className="py-3 px-4 font-semibold">Nombre</th>
              <th className="py-3 px-4 font-semibold">Nivel</th>
              <th className="py-3 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high text-body-sm font-body-sm text-on-surface">
            {categorias.map((c) => (
              <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                <td className="py-3.5 px-4 font-semibold">{c.nombre}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-body-sm font-semibold ${
                      c.esPreferente ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-surface-container-high text-secondary"
                    }`}
                  >
                    {c.esPreferente ? "Preferente" : "Regular"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button onClick={() => abrirEditar(c)} className="text-secondary hover:text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title={editando ? "Editar categoría" : "Nueva categoría"} onClose={() => { setCreando(false); setEditando(null); }}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-label-md font-label-md text-secondary mb-1">Nombre</label>
              <input
                className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-outline text-primary focus:ring-on-surface"
                checked={form.esPreferente}
                onChange={(e) => setForm({ ...form, esPreferente: e.target.checked })}
              />
              <span className="text-body-sm text-on-surface">Es parte del conjunto preferente</span>
            </label>
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
