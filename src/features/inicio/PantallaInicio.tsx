import { useApp } from '../../estado/AppProvider';
import { SimboloPalo } from '../../ui/SimboloPalo';
import { useInstalarPWA } from '../../ui/useInstalarPWA';

export function PantallaInicio() {
  const { setPantallaActual, setAjustesAbiertos, partida } = useApp();
  const { puedeInstalar, instalar, mostrarAyudaIOS } = useInstalarPWA();
  const enCurso = partida.enCurso;

  return (
    <main className="entrar my-auto flex w-full flex-col items-center py-4 text-center">
      <div className="mb-3 flex items-center gap-3" aria-hidden="true">
        <SimboloPalo palo="picas" color="#E2E8F0" className="h-7 w-7" />
        <SimboloPalo palo="corazones" color="#EF4444" className="h-7 w-7" />
        <SimboloPalo palo="diamantes" color="#EF4444" className="h-7 w-7" />
        <SimboloPalo palo="treboles" color="#E2E8F0" className="h-7 w-7" />
      </div>

      <h1 className="font-display text-5xl font-black tracking-wide text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">La Canasta</h1>
      <p className="mb-8 mt-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-200">Anotador inteligente de puntos</p>

      <div className="flex w-full flex-col gap-3">
        <button type="button" onClick={partida.irANuevaPartida} className="btn-primario w-full border-white/30 py-4 text-lg">
          <SimboloPalo palo="picas" color="#FFFFFF" className="h-5 w-5" /> Nueva Partida
        </button>

        {enCurso.length > 0 && (
          <button
            type="button"
            onClick={() => partida.reanudarPartida(enCurso[0]!.id)}
            className="btn-secundario latir w-full py-4 text-lg"
          >
            ▶ Continuar Partida{enCurso.length > 1 ? ` (${enCurso.length} en curso)` : ''}
          </button>
        )}

        <button type="button" onClick={() => setPantallaActual('jugadores')} className="btn-claro w-full py-4 text-lg">
          <SimboloPalo palo="corazones" className="h-5 w-5" /> Jugadores, Estadísticas e Historial
        </button>
        <button type="button" onClick={() => setPantallaActual('reglas')} className="btn-claro w-full py-4 text-lg">
          <SimboloPalo palo="diamantes" className="h-5 w-5" /> Manual, Cartas y Reglas
        </button>
      </div>

      <div className="mt-6 flex w-full flex-col items-center gap-2">
        {puedeInstalar && (
          <button type="button" onClick={() => void instalar()} className="btn-fantasma w-full py-3 text-sm">
            📲 Instalar la app en este dispositivo
          </button>
        )}
        {mostrarAyudaIOS && (
          <p className="text-xs text-blue-200">📲 Para instalarla en iPhone: tocá Compartir y elegí «Añadir a pantalla de inicio».</p>
        )}
        <button type="button" onClick={() => setAjustesAbiertos(true)} className="px-3 py-2 text-xs font-bold text-blue-200 underline underline-offset-4">
          ⚙️ Ajustes y copia de seguridad
        </button>
      </div>
    </main>
  );
}
