import { CONFIG_PUNTAJE } from '../../../constantes';
import { subtituloParticipante } from '../../../dominio/partida';
import { formatearPuntos } from '../../../dominio/puntuacion';
import { useApp } from '../../../estado/AppProvider';
import { EvolucionPartida } from '../../../ui/EvolucionPartida';
import { InsigniaApertura } from '../componentes/InsigniaApertura';
import type { PropsPaso } from './tiposPaso';

export function PasoMesa({ partida, vista }: PropsPaso) {
  const { partida: estado, abrirPodio } = useApp();
  const { objetivo } = partida;
  const v = CONFIG_PUNTAJE.valorCarta;
  const lider = Math.max(...partida.participantes.map((participante) => vista.totalesInicioRonda[participante.id] ?? 0));

  const terminarPartida = () => {
    if (estado.finalizarPartida(false)) abrirPodio(partida.id);
  };

  return (
    <section className="entrar flex flex-col gap-4">
      {vista.metaYaAlcanzadaCerrada && (
        <div className="tarjeta tarjeta-acento-azul flex flex-col gap-2 p-4">
          <span className="font-display text-base font-black text-azul">🏁 ¡Alguien llegó a la meta!</span>
          <p className="text-sm text-slate-600">Ya hay un jugador/equipo con {objetivo?.toLocaleString('es-AR')} puntos o más. Podés cerrar la partida o seguir jugando.</p>
          <button type="button" onClick={terminarPartida} className="btn-primario py-3 text-sm">
            Terminar partida y ver podio
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {partida.participantes.map((participante) => {
          const acumulado = vista.totalesInicioRonda[participante.id] ?? 0;
          const avance = objetivo ? Math.max(0, Math.min(100, (acumulado / objetivo) * 100)) : 0;
          return (
            <article key={participante.id} className="tarjeta flex flex-col gap-2.5 p-4">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-xl font-black text-azul">{participante.nombre}</h3>
                  {subtituloParticipante(participante) && <span className="block truncate text-xs font-semibold text-slate-500">{subtituloParticipante(participante)}</span>}
                </div>
                <div className="text-right">
                  <span className={`block text-3xl font-black leading-none tabular-nums ${acumulado < 0 ? 'text-rojo-osc' : 'text-tinta'}`}>{formatearPuntos(acumulado)}</span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">acumulado</span>
                </div>
              </div>

              {objetivo !== null && (
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                  <span>Meta {objetivo.toLocaleString('es-AR')} pts</span>
                  <span>{Math.round(avance)}%</span>
                </div>
              )}
              {objetivo !== null && (
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={Math.round(avance)} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance hacia ${objetivo} puntos`}>
                  <div className="h-full rounded-full bg-azul-vivo transition-all" style={{ width: `${avance}%` }} />
                </div>
              )}

              {acumulado < lider && <span className="-mt-1 text-xs font-semibold text-slate-500">A {formatearPuntos(lider - acumulado)} pts del líder</span>}

              <InsigniaApertura puntosAcumulados={acumulado} config={partida.reglas.apertura} />
            </article>
          );
        })}
      </div>

      {partida.rondas.length > 0 && (
        <section className="tarjeta p-4">
          <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-azul">Evolución de la partida</h3>
          <EvolucionPartida partida={partida} />
        </section>
      )}

      <details className="tarjeta p-4">
        <summary className="cursor-pointer text-sm font-black text-azul">📌 Referencia rápida de puntos</summary>
        <ul className="mt-3 flex flex-col gap-1 text-xs text-slate-700">
          <li>4 al 7: <strong>{v.c5}</strong> · 8 al K: <strong>{v.c10}</strong> · Ases y los dos: <strong>{v.c20}</strong> · Joker: <strong>{v.c50}</strong></li>
          <li>Canasta estándar: pura <strong>{CONFIG_PUNTAJE.canastaEstandar.pura}</strong> / impura <strong>{CONFIG_PUNTAJE.canastaEstandar.impura}</strong></li>
          <li>Canasta de Ases: pura <strong>{CONFIG_PUNTAJE.canastaAses.pura}</strong> / impura <strong>{CONFIG_PUNTAJE.canastaAses.impura}</strong></li>
          <li>Canasta de Comodines: <strong>{CONFIG_PUNTAJE.canastaComodines}</strong></li>
          <li>Tres Rojos: <strong>100</strong> c/u · 4: <strong>{CONFIG_PUNTAJE.tresRojos[4]}</strong> · 5: <strong>{CONFIG_PUNTAJE.tresRojos[5].toLocaleString('es-AR')}</strong></li>
          <li>Tres Negros en mano: <strong>−{CONFIG_PUNTAJE.penalidadTresNegro}</strong> c/u</li>
          <li>Corte exacto: <strong>+{CONFIG_PUNTAJE.bonoCorteExacto}</strong> · Cerrar la ronda: <strong>+{CONFIG_PUNTAJE.bonoCierre}</strong> · Espejito: <strong>+{CONFIG_PUNTAJE.bonoEspejito}</strong></li>
        </ul>
      </details>

      <button type="button" onClick={() => estado.irAPaso('puntos')} className="btn-secundario w-full py-4 text-lg">
        Terminar ronda y cargar puntos ➔
      </button>
    </section>
  );
}
