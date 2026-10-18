import { useEffect, useRef } from 'react';
import { subtituloParticipante } from '../../../dominio/partida';
import { formatearPuntos } from '../../../dominio/puntuacion';
import { useApp } from '../../../estado/AppProvider';
import { useSwipeHorizontal } from '../../../ui/useSwipeHorizontal';
import { InsigniaApertura } from '../componentes/InsigniaApertura';
import { BloqueBonificaciones, BloqueCanastas, BloqueCartasMano, BloqueCartasMesa } from '../componentes/BloquesPuntos';
import type { PropsPaso } from './tiposPaso';

export function PasoPuntos({ partida, vista }: PropsPaso) {
  const { partida: estado } = useApp();
  const { borrador, participantes } = partida;
  const indice = Math.min(borrador.seleccionIdx, participantes.length - 1);
  const participante = participantes[indice]!;
  const entrada = borrador.entradas[participante.id]!;
  const esUltimo = indice === participantes.length - 1;
  const chipActivoRef = useRef<HTMLButtonElement | null>(null);
  const inicioPanelRef = useRef<HTMLDivElement | null>(null);

  const irA = (nuevo: number) => {
    estado.seleccionarParticipante(nuevo);
    inicioPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const { iniciarTouch, finalizarTouch } = useSwipeHorizontal({
    onSwipeIzquierda: () => indice < participantes.length - 1 && irA(indice + 1),
    onSwipeDerecha: () => indice > 0 && irA(indice - 1),
  });

  useEffect(() => {
    chipActivoRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [indice]);

  return (
    <section className="flex flex-col gap-4" onTouchStart={iniciarTouch} onTouchEnd={finalizarTouch}>
      <div ref={inicioPanelRef} className="scroll-oculto -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Jugadores / equipos">
        {participantes.map((candidato, posicion) => {
          const activo = posicion === indice;
          const total = vista.desgloses[candidato.id]?.total ?? 0;
          return (
            <button
              key={candidato.id}
              ref={activo ? chipActivoRef : undefined}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => irA(posicion)}
              className={`${activo ? 'btn-primario border-white/50' : 'btn-fantasma'} shrink-0 flex-col gap-0 px-4 py-2`}
            >
              <span className="max-w-28 truncate text-sm">{candidato.nombre}</span>
              <span className="text-[11px] font-bold tabular-nums opacity-85">{formatearPuntos(total, true)}</span>
            </button>
          );
        })}
      </div>

      <div className="tarjeta tarjeta-acento-azul flex flex-col gap-2.5 p-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {indice + 1} de {participantes.length}
            </span>
            <h3 className="truncate font-display text-xl font-black text-azul">{participante.nombre}</h3>
            {subtituloParticipante(participante) && <span className="block truncate text-xs font-semibold text-slate-500">{subtituloParticipante(participante)}</span>}
          </div>
          <div className="text-right">
            <span className={`block text-3xl font-black leading-none tabular-nums ${(vista.desgloses[participante.id]?.total ?? 0) < 0 ? 'text-rojo-osc' : 'text-azul'}`}>
              {formatearPuntos(vista.desgloses[participante.id]?.total ?? 0, true)}
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-400">esta ronda</span>
          </div>
        </div>
        <InsigniaApertura puntosAcumulados={vista.totalesInicioRonda[participante.id] ?? 0} compacta />
      </div>

      <BloqueBonificaciones partida={partida} participante={participante} entrada={entrada} />
      <BloqueCanastas partida={partida} participante={participante} entrada={entrada} />
      <BloqueCartasMesa partida={partida} participante={participante} entrada={entrada} />
      <BloqueCartasMano partida={partida} participante={participante} entrada={entrada} />

      <div className="pie-seguro sticky bottom-0 -mx-4 grid grid-cols-[auto_1fr] gap-2 bg-gradient-to-t from-noche via-noche/95 to-transparent px-4 pt-6">
        <button type="button" onClick={() => irA(indice - 1)} disabled={indice === 0} className="btn-fantasma px-4 py-3.5 text-sm">
          ← Anterior
        </button>
        {esUltimo ? (
          <button type="button" onClick={() => estado.irAPaso('resumen')} className="btn-secundario py-3.5 text-base">
            Ver resumen ➔
          </button>
        ) : (
          <button type="button" onClick={() => irA(indice + 1)} className="btn-primario border-white/30 py-3.5 text-base">
            Siguiente: {participantes[indice + 1]!.nombre} ➔
          </button>
        )}
      </div>
    </section>
  );
}
