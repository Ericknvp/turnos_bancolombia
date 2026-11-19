import { useEffect, useState } from "react";
import { ApiException, parametrosApi } from "../../api/client";

export default function ParametrosTab() {
  const [umbral, setUmbral] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    parametrosApi.obtener().then((d) => setUmbral(d.umbralEnvejecimientoMinutos));
  }, []);

  async function guardar() {
    if (umbral === null) return;
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      await parametrosApi.actualizar(umbral);
      setMensaje("Parámetro actualizado correctamente");
    } catch (err) {
      setError(err instanceof ApiException ? err.message : "No se pudo actualizar el parámetro");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="bg-surface-container-lowest rounded-lg border border-surface-container-high shadow-sm p-space-lg max-w-lg">
      <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold tracking-tight">
        Parámetros del sistema
      </h2>
      <p className="text-body-sm font-body-sm text-secondary mt-0.5 mb-5">
        Umbral de envejecimiento: minutos que debe esperar un turno Regular en EN_ESPERA para competir como
        preferente, sin cambiar su categoría original.
      </p>

      <label className="block text-label-md font-label-md text-secondary uppercase tracking-wider mb-1">
        Umbral de envejecimiento (minutos)
      </label>
      <input
        type="number"
        min={1}
        className="w-full border border-surface-container-high rounded p-3 text-headline-sm font-headline-sm font-bold text-on-surface focus:ring-1 focus:ring-on-surface outline-none"
        value={umbral ?? ""}
        onChange={(e) => setUmbral(Number(e.target.value))}
      />

      {mensaje && <p className="text-emerald-700 text-body-sm mt-2">{mensaje}</p>}
      {error && <p className="text-error text-body-sm mt-2">{error}</p>}

      <button
        onClick={guardar}
        disabled={guardando || umbral === null}
        className="mt-4 px-5 py-2.5 rounded bg-primary-container text-on-primary-fixed font-title-md text-title-md font-semibold disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Guardar parámetros"}
      </button>
    </section>
  );
}
