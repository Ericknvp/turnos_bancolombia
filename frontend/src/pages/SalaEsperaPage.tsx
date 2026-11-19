import { useEffect, useState } from "react";
import { publicoApi } from "../api/client";
import type { TurnoPublico } from "../api/types";

function useReloj() {
  const [ahora, setAhora] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return ahora;
}

function formatoHora(fecha: Date) {
  return fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
}

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatoFecha(fecha: Date) {
  return `${DIAS[fecha.getDay()]}, ${fecha.getDate()} de ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

export default function SalaEsperaPage() {
  const ahora = useReloj();
  const [llamados, setLlamados] = useState<TurnoPublico[]>([]);

  useEffect(() => {
    function cargar() {
      publicoApi.pantalla().then(setLlamados).catch(() => {});
    }
    cargar();
    const id = setInterval(cargar, 4000);
    return () => clearInterval(id);
  }, []);

  const actual = llamados[0] ?? null;
  const recientes = llamados.slice(1);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-body-md select-none bg-[#111827] text-surface-container-lowest">
      <header className="h-20 bg-[#161F30] px-margin-tv flex items-center justify-between border-b border-[#2A374D] flex-shrink-0">
        <div className="flex items-center gap-space-lg">
          <div className="flex items-center gap-space-sm">
            <span className="w-3.5 h-10 bg-primary-container rounded" />
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-bold tracking-tight text-surface-container-lowest leading-none">
                Bancolombia
              </span>
              <span className="font-label-md text-label-md text-[#94A3B8] tracking-widest mt-1">
                GESTIÓN DE TURNOS
              </span>
            </div>
          </div>
          <div className="h-8 w-px bg-[#2A374D]" />
          <div className="flex items-center gap-space-xs text-[#E2E8F0]">
            <span className="material-symbols-outlined text-primary-container text-[24px]">storefront</span>
            <span className="font-title-md text-title-md font-semibold text-surface-container-lowest">
              Sede Central
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-xl">
          <div className="flex items-center gap-space-xs bg-[#1F293D] px-space-md py-space-xs rounded-lg border border-[#334155]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-label-md text-label-md text-[#CBD5E1]">SISTEMA EN LÍNEA</span>
          </div>
          <div className="text-right">
            <div className="font-headline-lg text-headline-lg font-bold text-surface-container-lowest leading-tight">
              {formatoHora(ahora)}
            </div>
            <div className="font-label-md text-label-md text-primary-container font-semibold tracking-wide">
              {formatoFecha(ahora)}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-gutter-tv p-margin-tv overflow-hidden items-stretch">
        <section className="col-span-7 flex flex-col justify-between">
          <div className="relative bg-[#1A2234] border-2 border-primary-container rounded-xl p-space-xl flex-1 flex flex-col justify-between hero-glow">
            <div className="flex items-center justify-between border-b border-[#2A374D] pb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary-container text-[32px]">volume_up</span>
                <div>
                  <span className="font-title-md text-title-md font-bold tracking-widest text-primary-container block leading-none">
                    ÚLTIMO TURNO LLAMADO
                  </span>
                  <span className="font-label-md text-label-md text-[#94A3B8]">NOW SERVING</span>
                </div>
              </div>
              {actual?.esPreferente && (
                <div className="flex items-center gap-space-xs bg-[#EFF6FF] border border-[#BFDBFE] px-space-md py-space-xs rounded-lg">
                  <span className="material-symbols-outlined text-[#2563EB] text-[24px]">accessible_forward</span>
                  <span className="font-label-lg text-label-lg font-bold text-[#2563EB] tracking-wide">
                    ATENCIÓN PREFERENCIAL
                  </span>
                </div>
              )}
            </div>

            <div className="my-auto py-space-lg text-center flex flex-col items-center justify-center">
              <span className="font-label-lg text-label-lg text-[#94A3B8] font-semibold tracking-widest uppercase mb-1">
                CÓDIGO DE TURNO
              </span>
              <div className="font-display-turn-tv text-display-turn-tv font-black text-surface-container-lowest tracking-tight py-2 leading-none">
                {actual?.codigo ?? "— — —"}
              </div>
              {actual && (
                <div className="flex items-center gap-space-sm mt-3 text-primary-container">
                  <span className="material-symbols-outlined animate-bounce text-[36px]">arrow_downward</span>
                  <span className="font-title-md text-title-md font-semibold text-primary-container">
                    POR FAVOR ACÉRQUESE AL MÓDULO INDICADO
                  </span>
                  <span className="material-symbols-outlined animate-bounce text-[36px]">arrow_downward</span>
                </div>
              )}
            </div>

            <div className="mt-auto">
              <div className="bg-primary-container rounded-lg p-space-lg text-[#1C1C1C] flex items-center justify-between shadow-xl">
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg font-bold tracking-widest uppercase text-on-primary-container leading-none">
                    DIRÍJASE A:
                  </span>
                  <span className="font-headline-lg text-headline-lg font-black tracking-tight text-[#1C1C1C] mt-1 leading-none">
                    {actual?.modulo ?? "Esperando próximo llamado"}
                  </span>
                </div>
                <div className="w-16 h-16 rounded-full bg-[#1C1C1C] flex items-center justify-center text-primary-container flex-shrink-0">
                  <span className="material-symbols-outlined text-[36px]">arrow_forward</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-body-sm font-body-sm text-[#94A3B8] mt-space-sm px-space-xs">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  Privacidad y Seguridad Garantizada
                </span>
                <span>Sin exposición de datos personales según Ley 1581</span>
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-5 flex flex-col justify-between">
          <div className="bg-[#1A2234] border border-[#2A374D] rounded-xl flex-1 flex flex-col overflow-hidden shadow-lg">
            <div className="px-space-lg py-space-md bg-[#161F30] border-b border-[#2A374D] flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-container text-[24px]">history</span>
                <h2 className="font-title-md text-title-md font-bold text-surface-container-lowest tracking-wide">
                  TURNOS LLAMADOS RECIENTES
                </h2>
              </div>
              <span className="font-label-md text-label-md text-[#94A3B8] font-semibold">ESTADO ACTUAL</span>
            </div>
            <div className="flex-1 flex flex-col justify-start p-space-sm gap-1 overflow-y-auto custom-scroll">
              {recientes.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-[#64748B] font-body-md text-body-md">
                  Sin más turnos llamados por ahora
                </div>
              )}
              {recientes.map((t) => (
                <div
                  key={t.codigo}
                  className="flex items-center justify-between px-space-md py-space-sm hover:bg-[#1E293B] rounded transition-colors"
                >
                  <div className="flex items-center gap-space-md">
                    <span className="font-headline-sm text-headline-sm font-extrabold text-surface-container-lowest tracking-wider">
                      {t.codigo}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-title-md text-title-md font-semibold text-surface-container-lowest">
                        {t.modulo}
                      </span>
                      <span className="font-body-sm text-body-sm text-[#94A3B8]">{t.servicio}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs bg-[#24314A] px-space-sm py-1 rounded border border-[#334155]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-label-md text-label-md text-[#CBD5E1]">
                      {t.estado === "EN_ATENCION" ? "Atendiendo" : "En Módulo"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="h-14 bg-[#0F172A] border-t border-[#2A374D] flex items-center overflow-hidden flex-shrink-0 relative">
        <div className="h-full bg-primary-container text-[#1C1C1C] font-label-lg text-label-lg font-extrabold flex items-center px-space-lg gap-space-xs z-10 shadow-lg flex-shrink-0">
          <span className="material-symbols-outlined text-[22px]">security</span>
          <span>INFORMACIÓN BANCARIA</span>
        </div>
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="animate-marquee font-body-lg text-body-lg text-[#E2E8F0] tracking-wide flex items-center gap-space-2xl">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">lock</span>
              <strong>Por su seguridad:</strong> Bancolombia NUNCA le solicitará sus claves, códigos de seguridad o
              tokens por teléfono, correo electrónico ni mensajes de texto.
            </span>
            <span className="text-primary-container">•</span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">badge</span>
              Recuerde tener su documento de identidad original a la mano antes de pasar al módulo asignado.
            </span>
          </div>
        </div>
        <div className="h-full bg-[#161F30] px-space-md border-l border-[#2A374D] flex items-center gap-space-xs text-[#94A3B8] z-10 flex-shrink-0">
          <span className="material-symbols-outlined text-primary-container text-[20px]">graphic_eq</span>
          <span className="font-label-md text-label-md font-semibold text-[#CBD5E1]">Audio Activo</span>
        </div>
      </footer>
    </div>
  );
}
