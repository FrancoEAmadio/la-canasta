import { useEffect } from 'react';
import { useApp } from '../../estado/AppProvider';
import { formatearPuntos } from '../../dominio/puntuacion';
import type { PasoPartida } from '../../tipos';
import { PasoPuntos } from './pasos/PasoPuntos';
import { PasoResumen } from './pasos/PasoResumen';

const PASOS: [PasoPartida, string][] = [
  ['puntos', '1. Puntos'],
  ['resumen', '2. Resumen'],
];
const ORDEN: PasoPartida[] = ['puntos', 'resumen'];

export function PantallaPartida() {
  const { partida: estado, setMenuPartidaAbierto, setRondasAbiertas, abrirPodio, setPantallaActual } = useApp();
  const { partidaActiva: partida, vista } = estado;

  // Si no hay partida activa (por ejemplo, tras descartarla), se vuelve al inicio.
  useEffect(() => {
    if (!partida) setPantallaActual('inicio');
  }, [partida, setPantallaActual]);

  if (!partida || !vista) return null;

  const { borrador } = partida;
  const pasoActual = ORDEN.indexOf(borrador.paso);
  const editando = borrador.editandoIdx !== null;

  return (
    <main className="flex w-full flex-1 flex-col gap-4 py-4">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setPantallaActual('inicio')} className="btn-fantasma px-3 py-2 text-sm">
            ← Menú
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Partida en curso · {partida.modo === 'parejas' ? 'Parejas' : 'Individual'}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMenuPartidaAbierto(true)} aria-label="Abrir menú de partida" className="btn-fantasma h-11 w-11 p-0">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <span className="block text-xs font-black uppercase tracking-widest text-blue-200">Ronda {vista.numeroRonda}</span>
              <h2 className="font-display text-lg font-black leading-tight text-white">
                {partida.objetivo === null ? 'Sin límite de puntos' : `Meta: ${formatearPuntos(partida.objetivo)}`}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setRondasAbiertas(true)} className="btn-claro px-3.5 py-2.5 text-xs">
              📋 Tabla
            </button>
            <button type="button" onClick={() => abrirPodio(partida.id)} className="btn-claro px-3.5 py-2.5 text-xs">
              🏆 Podio
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-2" aria-label="Pasos de la ronda">
          {PASOS.map(([paso, etiqueta], indice) => {
            const actual = indice === pasoActual;
            const puedeVolver = indice < pasoActual;
            return (
              <button
                key={paso}
                type="button"
                disabled={!puedeVolver}
                aria-current={actual ? 'step' : undefined}
                onClick={() => estado.irAPaso(paso)}
                className="flex flex-1 flex-col items-center gap-1 rounded-lg px-0.5 py-1 disabled:cursor-default"
              >
                <span className={`h-1.5 w-full rounded-full ${actual ? 'bg-white' : puedeVolver ? 'bg-blue-300' : 'bg-white/20'}`} />
                <span className={`text-[10px] font-black uppercase ${actual ? 'text-white' : puedeVolver ? 'text-blue-200' : 'text-white/40'}`}>{etiqueta}</span>
              </button>
            );
          })}
        </nav>

        {editando && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2">
            <span className="text-xs font-black text-amber-900">✏️ Corrigiendo la ronda {vista.numeroRonda}</span>
            <button type="button" onClick={estado.cancelarEdicion} className="btn-claro px-2.5 py-1 text-[11px]">
              Cancelar corrección
            </button>
          </div>
        )}
      </header>

      {borrador.paso === 'puntos' && <PasoPuntos partida={partida} vista={vista} />}
      {borrador.paso === 'resumen' && <PasoResumen partida={partida} vista={vista} />}
    </main>
  );
}
