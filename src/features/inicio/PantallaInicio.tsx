import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { SimboloPalo } from '../../ui/SimboloPalo';
import { useInstalarPWA } from '../../ui/useInstalarPWA';
import { ModalPartidasEnCurso } from './ModalPartidasEnCurso';

export function PantallaInicio() {
  const { setPantallaActual, setAjustesAbiertos, partida } = useApp();
  const { puedeInstalar, instalar, mostrarAyudaIOS } = useInstalarPWA();
  const enCurso = partida.enCurso;
  const [selectorAbierto, setSelectorAbierto] = useState(false);

  return (
    <main className="entrar relative mx-auto my-auto flex w-full max-w-xl flex-col items-center px-4 py-4 text-center md:px-0">
      <button
        type="button"
        onClick={() => setAjustesAbiertos(true)}
        aria-label="Ajustes y copia de seguridad"
        className="btn-fantasma absolute right-0 top-0 h-11 w-11 !rounded-full p-0"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.08 4.14l.06.06a1.7 1.7 0 0 0 1.87.34h0A1.7 1.7 0 0 0 10.04 3V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v0A1.7 1.7 0 0 0 21 10.04H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z" />
        </svg>
      </button>
      <h1 className="mt-10 flex w-full flex-col items-center md:mt-12" aria-label="La Canasta">
        <span className="flex items-center gap-4" aria-hidden="true">
          <SimboloPalo palo="picas" color="#E2E8F0" className="h-9 w-9 md:h-11 md:w-11" />
          <SimboloPalo palo="corazones" color="#EF4444" className="h-9 w-9 md:h-11 md:w-11" />
          <SimboloPalo palo="diamantes" color="#EF4444" className="h-9 w-9 md:h-11 md:w-11" />
          <SimboloPalo palo="treboles" color="#E2E8F0" className="h-9 w-9 md:h-11 md:w-11" />
        </span>
        <span className="mt-4 flex w-full items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-blue-200/70" />
          <span className="font-display text-xl font-bold uppercase tracking-[0.5em] text-blue-100 md:text-2xl">La</span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-blue-200/70" />
        </span>
        <span className="titulo-inicio font-display font-black uppercase leading-none" aria-hidden="true">
          Canasta
        </span>
      </h1>
      <p className="mb-6 mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-white md:mb-9">Anotador inteligente de puntos</p>

      <div className="flex w-full flex-col gap-3 md:gap-4">
        <button type="button" onClick={partida.irANuevaPartida} className="btn-primario w-full border-white/30 py-4 text-lg md:py-5">
          Nueva Partida
        </button>

        {enCurso.length > 0 && (
          <button
            type="button"
            onClick={() => (enCurso.length === 1 ? partida.reanudarPartida(enCurso[0]!.id) : setSelectorAbierto(true))}
            className="btn-secundario latir w-full py-4 text-lg md:py-5"
          >
            Continuar Partida{enCurso.length > 1 ? ` (${enCurso.length} en curso)` : ''}
          </button>
        )}

        <button type="button" onClick={() => setPantallaActual('jugadores')} className="btn-claro w-full py-4 text-lg md:py-5">
          Jugadores, Estadísticas e Historial
        </button>
        <button type="button" onClick={() => setPantallaActual('reglas')} className="btn-claro w-full py-4 text-lg md:py-5">
          Manual, Cartas y Reglas
        </button>
      </div>

      <div className="mt-4 flex w-full flex-col items-center gap-2 md:mt-6">
        {puedeInstalar && (
          <button type="button" onClick={() => void instalar()} className="btn-fantasma w-full py-3 text-sm">
            Instalar la app en este dispositivo
          </button>
        )}
        {mostrarAyudaIOS && (
          <p className="text-xs text-blue-200">Para instalarla en iPhone: tocá Compartir y elegí «Añadir a pantalla de inicio».</p>
        )}
      </div>
      <ModalPartidasEnCurso abierto={selectorAbierto && enCurso.length > 0} onCerrar={() => setSelectorAbierto(false)} />
    </main>
  );
}
