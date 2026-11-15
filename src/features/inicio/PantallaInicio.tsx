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
    <main className="entrar relative mx-auto my-auto flex w-full max-w-xl flex-col items-center py-4 text-center">
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
      <div className="mb-3 mt-10 flex items-center gap-3" aria-hidden="true">
        <SimboloPalo palo="picas" color="#E2E8F0" className="h-7 w-7" />
        <SimboloPalo palo="corazones" color="#EF4444" className="h-7 w-7" />
        <SimboloPalo palo="diamantes" color="#EF4444" className="h-7 w-7" />
        <SimboloPalo palo="treboles" color="#E2E8F0" className="h-7 w-7" />
      </div>

      <h1 className="font-display text-5xl font-bold tracking-wide text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">La Canasta</h1>
      <p className="mb-9 mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">Anotador inteligente de puntos</p>

      <div className="flex w-full flex-col gap-4">
        <button type="button" onClick={partida.irANuevaPartida} className="btn-primario w-full border-white/30 py-5 text-lg">
          Nueva Partida
        </button>

        {enCurso.length > 0 && (
          <button
            type="button"
            onClick={() => (enCurso.length === 1 ? partida.reanudarPartida(enCurso[0]!.id) : setSelectorAbierto(true))}
            className="btn-secundario latir w-full py-5 text-lg"
          >
            Continuar Partida{enCurso.length > 1 ? ` (${enCurso.length} en curso)` : ''}
          </button>
        )}

        <button type="button" onClick={() => setPantallaActual('jugadores')} className="btn-claro w-full py-5 text-lg">
          Jugadores, Estadísticas e Historial
        </button>
        <button type="button" onClick={() => setPantallaActual('reglas')} className="btn-claro w-full py-5 text-lg">
          Manual, Cartas y Reglas
        </button>
      </div>

      <div className="mt-6 flex w-full flex-col items-center gap-2">
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
