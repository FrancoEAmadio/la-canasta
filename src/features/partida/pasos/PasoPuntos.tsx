import { useEffect, useRef } from 'react';
import { subtituloParticipante } from '../../../dominio/partida';
import { formatearPuntos } from '../../../dominio/puntuacion';
import { useApp } from '../../../estado/AppProvider';
import { useSwipeHorizontal } from '../../../ui/useSwipeHorizontal';
import { InsigniaApertura } from '../componentes/InsigniaApertura';
import { BloqueBonificaciones, BloqueCanastas, BloqueCartasMano, BloqueCartasMesa } from '../componentes/BloquesPuntos';
import type { PropsPaso } from './tiposPaso';

export function PasoPuntos({ partida, vista }: PropsPaso) {
  const { partida: estado, abrirPodio } = useApp();
  const { borrador, participantes } = partida;
  const indice = Math.min(borrador.seleccionIdx, participantes.length - 1);
  const participante = participantes[indice]!;
  const entrada = borrador.entradas[participante.id]!;
  const esUltimo = indice === participantes.length - 1;
  const editando = borrador.editandoIdx !== null;
  const totalActivo = vista.desgloses[participante.id]?.total ?? 0;
  const { mezcla, reparte } = vista.quienReparte;
  /** Hasta 4 participantes se reparten en columnas iguales; con más, el selector se desliza. */
  const repartidos = participantes.length <= 4;
  const chipActivoRef = useRef<HTMLButtonElement | null>(null);
  const inicioPanelRef = useRef<HTMLDivElement | null>(null);

  const terminarPartida = () => {
    if (estado.finalizarPartida(false)) abrirPodio(partida.id);
  };

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
      {/* Aviso compacto de quién mezcla y corta, y quién reparte, en esta mano. */}
      {!editando && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-[11px] text-blue-100">
          <span className="min-w-0 truncate">
            ✂️ Mezcla y corta: <strong className="text-white">{mezcla}</strong>
          </span>
          <span className="min-w-0 truncate">
            🃏 Reparte: <strong className="text-white">{reparte}</strong>
          </span>
        </div>
      )}

      {vista.metaYaAlcanzadaCerrada && !editando && (
        <div className="tarjeta tarjeta-acento-azul flex flex-col gap-2 p-4">
          <span className="font-display text-base font-black text-azul">🏁 ¡Alguien llegó a la meta!</span>
          <p className="text-sm text-slate-600">Ya hay un jugador/equipo con {partida.objetivo?.toLocaleString('es-AR')} puntos o más. Podés cerrar la partida o seguir jugando.</p>
          <button type="button" onClick={terminarPartida} className="btn-primario py-3 text-sm">
            Terminar partida y ver podio
          </button>
        </div>
      )}

      {/* Marca el inicio del panel: al cambiar de jugador se vuelve acá (el selector queda fijo arriba). */}
      <div ref={inicioPanelRef} aria-hidden="true" className="-mb-4 h-0" />

      {/* Cabecera fija: pestañas de igual tamaño + mínimo para abrirse + subtotal de la ronda en vivo. */}
      <div className="sticky top-0 z-20 -mx-4 px-4 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="rounded-2xl bg-noche-2/90 p-1 shadow-lg shadow-black/30 ring-1 ring-white/15 backdrop-blur">
          <div role="tablist" aria-label="Jugadores / equipos" className={`selector-jugadores ${repartidos ? '' : 'selector-jugadores-scroll scroll-oculto'}`}>
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
                  title={candidato.nombre}
                  onClick={() => irA(posicion)}
                  className={`selector-jugador ${activo ? 'bg-white text-azul shadow-sm' : 'text-white/80 active:bg-white/10'}`}
                >
                  <span className="selector-jugador-nombre text-xs font-black">{candidato.nombre}</span>
                  <span className={`selector-jugador-total text-[11px] font-bold tabular-nums ${activo ? (total < 0 ? 'text-rojo-osc' : 'text-azul-vivo') : 'opacity-75'}`}>
                    {formatearPuntos(total, true)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-between gap-2 rounded-xl bg-black/20 px-2 py-1.5">
            <div className="min-w-0 flex-1">
              <InsigniaApertura puntosAcumulados={vista.totalesInicioRonda[participante.id] ?? 0} config={partida.reglas.apertura} enLinea />
            </div>
            <div className="flex shrink-0 items-baseline gap-1.5">
              <span className="text-[10px] font-bold uppercase text-blue-200">Ronda</span>
              <span className={`text-xl font-black leading-none tabular-nums ${totalActivo < 0 ? 'text-red-300' : 'text-white'}`}>{formatearPuntos(totalActivo, true)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quién está cargando: nombre completo y, en parejas, sus integrantes. */}
      <div className="px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">
          {indice + 1} de {participantes.length}
        </span>
        <h3 className="fila-puntaje-nombre font-display text-xl font-black text-white">{participante.nombre}</h3>
        {subtituloParticipante(participante) && <span className="fila-puntaje-nombre text-xs font-semibold text-blue-200">{subtituloParticipante(participante)}</span>}
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
