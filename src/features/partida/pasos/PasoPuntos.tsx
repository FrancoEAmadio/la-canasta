import { useEffect, useRef } from 'react';
import { subtituloParticipante } from '../../../dominio/partida';
import { formatearPuntos } from '../../../dominio/puntuacion';
import { useApp } from '../../../estado/AppProvider';
import { vibrar } from '../../../infra/vibracion';
import { useGestosMultiDedo } from '../../../ui/useGestosMultiDedo';
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
  /** La barra muestra como máximo 3 pestañas enteras, con la del jugador activo en el medio (o en el borde si es el primero o el último). */
  const cantidad = participantes.length;
  const ventana = Math.min(3, cantidad);
  const desde = Math.max(0, Math.min(indice - 1, cantidad - 3));
  const inicioPanelRef = useRef<HTMLDivElement | null>(null);

  const terminarPartida = () => {
    if (estado.finalizarPartida(false)) abrirPodio(partida.id);
  };

  const irA = (nuevo: number) => {
    if (nuevo < 0 || nuevo >= cantidad || nuevo === indice) return;
    vibrar();
    estado.seleccionarParticipante(nuevo);
    inicioPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Deslizar con dos dedos cambia de jugador (con un dedo se anota y se hace scroll, así que no desliza).
  const gestos = useGestosMultiDedo({ dos: (direccion) => irA(indice + direccion) });

  // Solo el cuerpo (tarjeta y bloques) entra deslizándose desde el lado hacia el que se fue; la barra de jugadores y los botones quedan fijos.
  const previoRef = useRef(indice);
  const montadoRef = useRef(false);
  const animacion = !montadoRef.current ? '' : indice >= previoRef.current ? 'entra-derecha' : 'entra-izquierda';
  useEffect(() => {
    previoRef.current = indice;
    montadoRef.current = true;
  }, [indice]);

  return (
    <section className="flex flex-1 flex-col gap-4" {...gestos}>
      {/* Aviso compacto de quién mezcla y corta, y quién reparte, en esta mano. */}
      {!editando && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-[11px] text-blue-100">
          <span className="min-w-0 truncate">
            Mezcla y corta: <strong className="text-white">{mezcla}</strong>
          </span>
          <span className="min-w-0 truncate">
            Reparte: <strong className="text-white">{reparte}</strong>
          </span>
        </div>
      )}

      {vista.metaYaAlcanzadaCerrada && !editando && (
        <div className="tarjeta tarjeta-acento-azul flex flex-col gap-2 p-4">
          <span className="font-display text-base font-bold text-azul">🏁 ¡Alguien llegó a la meta!</span>
          <p className="text-sm text-slate-600">Ya hay un jugador/equipo con {partida.objetivo?.toLocaleString('es-AR')} puntos o más. Podés cerrar la partida o seguir jugando.</p>
          <button type="button" onClick={terminarPartida} className="btn-primario py-3 text-sm">
            Terminar partida y ver podio
          </button>
        </div>
      )}

      {/* Marca el inicio del panel: al cambiar de jugador se vuelve acá (el selector queda fijo arriba). */}
      <div ref={inicioPanelRef} aria-hidden="true" className="-mb-4 h-0" />

      {/* Barra fija: solo las pestañas de jugadores (todas del mismo ancho) con sus puntos. */}
      <div className="sangrado sticky top-0 z-20 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="rounded-2xl bg-noche-2/90 p-1 shadow-lg shadow-black/30 ring-1 ring-white/15 backdrop-blur">
          <div className="selector-ventana">
            <div role="tablist" aria-label="Jugadores / equipos" className="selector-pista" style={{ width: `${(cantidad / ventana) * 100}%`, transform: `translateX(-${(desde / cantidad) * 100}%)` }}>
              <span aria-hidden="true" className="selector-indicador" style={{ width: `${100 / cantidad}%`, transform: `translateX(${indice * 100}%)` }}>
                <span />
              </span>
              {participantes.map((candidato, posicion) => {
                const activo = posicion === indice;
                const total = vista.desgloses[candidato.id]?.total ?? 0;
                return (
                  <button
                    key={candidato.id}
                    type="button"
                    role="tab"
                    aria-selected={activo}
                    title={candidato.nombre}
                    onClick={() => irA(posicion)}
                    className={`selector-jugador ${activo ? 'text-azul' : 'text-white/80 active:bg-white/10'}`}
                  >
                    <span className="selector-jugador-nombre text-xs font-bold">{candidato.nombre}</span>
                    <span className={`selector-jugador-total text-[11px] font-bold tabular-nums ${activo ? (total < 0 ? 'text-rojo-osc' : 'text-azul-vivo') : 'opacity-75'}`}>
                      {formatearPuntos(total, true)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div key={participante.id} className={`flex flex-col gap-4 ${animacion}`}>
      <div className="tarjeta tarjeta-acento-azul flex flex-col gap-2.5 p-4">
        <div className="fila-puntaje !items-end">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {indice + 1} de {participantes.length}
            </span>
            <h3 className="fila-puntaje-nombre font-display text-xl font-bold text-azul">{participante.nombre}</h3>
            {subtituloParticipante(participante) && <span className="fila-puntaje-nombre text-xs font-semibold text-slate-500">{subtituloParticipante(participante)}</span>}
          </div>
          <div className="fila-puntaje-valor">
            <span className={`block text-3xl font-bold leading-none tabular-nums ${totalActivo < 0 ? 'text-rojo-osc' : 'text-azul'}`}>{formatearPuntos(totalActivo, true)}</span>
            <span className="text-[10px] font-bold uppercase text-slate-400">esta ronda</span>
          </div>
        </div>
        <InsigniaApertura puntosAcumulados={vista.totalesInicioRonda[participante.id] ?? 0} config={partida.reglas.apertura} compacta />
      </div>

      <BloqueBonificaciones partida={partida} participante={participante} entrada={entrada} />
      <BloqueCanastas partida={partida} participante={participante} entrada={entrada} />
      <BloqueCartasMesa partida={partida} participante={participante} entrada={entrada} />
      <BloqueCartasMano partida={partida} participante={participante} entrada={entrada} />
      </div>

      <div className="barra-inferior mt-auto grid grid-cols-[auto_1fr] gap-2">
        <button type="button" onClick={() => irA(indice - 1)} disabled={indice === 0} className="btn-fantasma px-4 py-3.5 text-sm">
          ← Anterior
        </button>
        {esUltimo ? (
          <button type="button" onClick={() => estado.irAPaso('resumen')} className="btn-secundario py-3.5 text-base">
            Ver resumen →
          </button>
        ) : (
          <button type="button" onClick={() => irA(indice + 1)} className="btn-primario border-white/30 py-3.5 text-base">
            Siguiente: {participantes[indice + 1]!.nombre} →
          </button>
        )}
      </div>
    </section>
  );
}
