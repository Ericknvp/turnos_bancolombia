import { useEffect, useState } from "react";
import { ApiException, usuariosApi } from "../../api/client";
import type { Usuario } from "../../api/types";
import { Modal } from "../../components/Modal";

const VACIO = { username: "", password: "", nombreCompleto: "", rol: "OPERADOR" };

export default function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState<string | null>(null);

  function cargar() {
    usuariosApi.listar().then(setUsuarios);
  }

  useEffect(cargar, []);

  function abrirCrear() {
    setForm(VACIO);
    setError(null);
    setCreando(true);
  }

  function abrirEditar(u: Usuario) {
    setForm({ username: u.username, password: "", nombreCompleto: u.nombreCompleto, rol: u.rol });
    setError(null);
    setEditando(u);
  }

  async function guardar() {
    setError(null);
    try {
      if (editando) {
        await usuariosApi.actualizar(editando.id, {
          username: form.username,
          nombreCompleto: form.nombreCompleto,
          rol: form.rol,
          password: form.password || undefined,
          activo: editando.activo,
        });
      } else {
        await usuariosApi.crear(form);
      }
      setEditando(null);
      setCreando(false);
      cargar();
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "No se pudo guardar el usuario");
    }
  }

  async function alternarActivo(u: Usuario) {
    await (u.activo ? usuariosApi.desactivar(u.id) : usuariosApi.activar(u.id));
    cargar();
  }

  const modalAbierto = creando || editando !== null;

  return (
    <section className="bg-surface-container-lowest rounded-lg border border-surface-container-high shadow-sm overflow-hidden flex flex-col">
      <div className="p-space-md border-b border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold tracking-tight">
            Gestión de usuarios y roles
          </h2>
          <p className="text-body-sm font-body-sm text-secondary mt-0.5">
            Administradores y operadores con acceso al sistema
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center justify-center gap-space-xs px-4 py-2.5 bg-primary-container hover:bg-[#E6C700] text-[#1C1C1C] rounded-lg font-label-lg text-label-lg font-semibold shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo usuario
        </button>
      </div>

      <div className="overflow-x-auto custom-scroll">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-surface-container-high text-secondary text-label-md font-label-md">
              <th className="py-3 px-4 font-semibold">Usuario</th>
              <th className="py-3 px-4 font-semibold">Nombre completo</th>
              <th className="py-3 px-4 font-semibold">Rol</th>
              <th className="py-3 px-4 font-semibold">Estado</th>
              <th className="py-3 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high text-body-sm font-body-sm text-on-surface">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                <td className="py-3.5 px-4 font-mono">{u.username}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-semibold">
                      {u.nombreCompleto
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <span className="font-semibold">{u.nombreCompleto}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-secondary">{u.rol}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-body-sm font-semibold ${
                      u.activo ? "bg-emerald-100 text-emerald-800" : "bg-surface-container-high text-secondary"
                    }`}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button onClick={() => abrirEditar(u)} className="text-secondary hover:text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => alternarActivo(u)} className="text-secondary hover:text-error">
                    <span className="material-symbols-outlined text-[18px]">
                      {u.activo ? "toggle_off" : "toggle_on"}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title={editando ? "Editar usuario" : "Nuevo usuario"} onClose={() => { setCreando(false); setEditando(null); }}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-label-md font-label-md text-secondary mb-1">Username</label>
              <input
                className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-secondary mb-1">Nombre completo</label>
              <input
                className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none"
                value={form.nombreCompleto}
                onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-secondary mb-1">
                Contraseña {editando && "(dejar vacío para no cambiarla)"}
              </label>
              <input
                type="password"
                className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-secondary mb-1">Rol</label>
              <select
                className="w-full border border-surface-container-high rounded p-2 text-body-md focus:ring-1 focus:ring-on-surface outline-none"
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
              >
                <option value="OPERADOR">Operador</option>
                <option value="ADMINISTRADOR">Administrador</option>
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
