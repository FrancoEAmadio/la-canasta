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
  /** Hasta 4 participantes se reparten en columnas iguales; con más, el selector se desliza. */
  const repartidos = participantes.length <= 4;
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
      {/* Marca el inicio del panel: al cambiar de jugador se vuelve acá (el selector queda fijo arriba). */}
      <div ref={inicioPanelRef} aria-hidden="true" className="-mb-4 h-0" />

      {/* Selector flotante de jugadores: ocupa todo el ancho, repartido en partes iguales. */}
      <div className="sticky top-0 z-20 -mx-4 px-4 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div
          role="tablist"
          aria-label="Jugadores / equipos"
          className={`rounded-2xl bg-noche-2/90 p-1 shadow-lg shadow-black/30 ring-1 ring-white/15 backdrop-blur ${
            repartidos ? 'grid gap-1' : 'scroll-oculto flex gap-1 overflow-x-auto'
          }`}
          style={repartidos ? { gridTemplateColumns: `repeat(${participantes.length}, minmax(0, 1fr))` } : undefined}
        >
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
                className={`flex min-w-0 flex-col items-center rounded-xl px-2 py-1.5 transition-colors ${repartidos ? '' : 'w-28 shrink-0'} ${
                  activo ? 'bg-white text-azul shadow-sm' : 'text-white/80 active:bg-white/10'
                }`}
              >
                <span className="w-full truncate text-center text-xs font-black">{candidato.nombre}</span>
                <span className={`text-[11px] font-bold tabular-nums ${activo ? (total < 0 ? 'text-rojo-osc' : 'text-azul-vivo') : 'opacity-75'}`}>
                  {formatearPuntos(total, true)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="tarjeta tarjeta-acento-azul flex flex-col gap-2.5 p-4">
        <div className="fila-puntaje !items-end">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {indice + 1} de {participantes.length}
            </span>
            <h3 className="fila-puntaje-nombre font-display text-xl font-black text-azul">{participante.nombre}</h3>
            {subtituloParticipante(participante) && <span className="fila-puntaje-nombre text-xs font-semibold text-slate-500">{subtituloParticipante(participante)}</span>}
          </div>
          <div className="fila-puntaje-valor">
            <span className={`block text-3xl font-black leading-none tabular-nums ${(vista.desgloses[participante.id]?.total ?? 0) < 0 ? 'text-rojo-osc' : 'text-azul'}`}>
              {formatearPuntos(vista.desgloses[participante.id]?.total ?? 0, true)}
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-400">esta ronda</span>
          </div>
        </div>
        <InsigniaApertura puntosAcumulados={vista.totalesInicioRonda[participante.id] ?? 0} config={partida.reglas.apertura} compacta />
      </div>

      <BloqueBonificaciones partida={partida} participante={participante} entrada={entrada} />
      <BloqueCanastas partida={partida} participante={participante} entrada={entrada} />
      <BloqueCartasMesa partida={partida} participante={participante} entrada={entrada} />
      <BloqueCartasMano partida={partida} participante={participante} entrada={entrada} />

      <div className="pie-seguro sticky bottom-0 z-20 -mx-4 grid grid-cols-[auto_1fr] gap-2 bg-linear-to-t from-noche from-70% to-noche/0 px-4 pt-6">
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
