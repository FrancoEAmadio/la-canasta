import { useState } from 'react';
import { calcularEntrada, formatearPuntos } from '../dominio/puntuacion';
import { useApp } from '../estado/AppProvider';
import type { Partida } from '../tipos';
import { GraficoEvolucion, type SerieGrafico } from './GraficoEvolucion';

type Vista = 'grafico' | 'tabla';

/** Puntos hechos en cada ronda y acumulado, por participante (misma cuenta que usa todo el resto de la app). */
function calcularFilas(partida: Partida) {
  return partida.participantes.map((participante) => {
    let acumulado = 0;
    const rondas = partida.rondas.map((ronda) => {
      const entrada = ronda.entradas[participante.id];
      const puntos = entrada ? calcularEntrada(entrada, partida.reglas).total : 0;
      acumulado += puntos;
      return { numero: ronda.numero, puntos, acumulado };
    });
    return { participante, rondas, total: acumulado };
  });
}

export function construirSeries(partida: Partida): SerieGrafico[] {
  return calcularFilas(partida).map((fila) => ({ nombre: fila.participante.nombre, puntos: [0, ...fila.rondas.map((ronda) => ronda.acumulado)] }));
}

/** Selector "📊 Ver Gráfico" / "📋 Ver Tabla" con la evolución de todos los jugadores y rondas. */
export function EvolucionPartida({ partida }: { partida: Partida }) {
  const { verAuditoria } = useApp();
  const [vista, setVista] = useState<Vista>('grafico');

  if (partida.rondas.length === 0) return <p className="text-xs text-slate-500">Todavía no hay rondas cerradas.</p>;

  const filas = calcularFilas(partida);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Forma de ver la evolución">
        {(
          [
            ['grafico', '📊 Ver Gráfico'],
            ['tabla', '📋 Ver Tabla'],
          ] as const
        ).map(([id, etiqueta]) => (
          <button key={id} type="button" role="tab" aria-selected={vista === id} onClick={() => setVista(id)} className={`${vista === id ? 'btn-primario' : 'btn-claro'} py-2.5 text-xs`}>
            {etiqueta}
          </button>
        ))}
      </div>

      {vista === 'grafico' ? (
        partida.rondas.length >= 1 && <GraficoEvolucion series={construirSeries(partida)} />
      ) : (
        <div className="scroll-oculto overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-right text-xs">
            <thead>
              <tr className="bg-slate-100 text-[10px] uppercase text-slate-500">
                <th className="sticky left-0 z-10 min-w-28 max-w-36 bg-slate-100 p-2 text-left">Jugador</th>
                {partida.rondas.map((ronda) => (
                  <th key={ronda.numero} className="whitespace-nowrap p-2">
                    Ronda {ronda.numero}
                  </th>
                ))}
                <th className="whitespace-nowrap p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr
                  key={fila.participante.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver el desglose de ${fila.participante.nombre}`}
                  onClick={() => verAuditoria(partida, fila.participante.id)}
                  onKeyDown={(evento) => (evento.key === 'Enter' || evento.key === ' ') && verAuditoria(partida, fila.participante.id)}
                  className="group cursor-pointer border-t border-slate-100 text-tinta"
                >
                  <th className="sticky left-0 z-10 min-w-28 max-w-36 bg-white p-2 text-left font-black group-active:bg-blue-50">
                    <span className="block text-[13px] leading-tight" style={{ overflowWrap: 'anywhere' }}>
                      {fila.participante.nombre}
                    </span>
                    <span className="block text-[10px] font-semibold text-azul">🔍 Ver desglose</span>
                  </th>
                  {fila.rondas.map((ronda) => (
                    <td key={ronda.numero} className="whitespace-nowrap p-2 tabular-nums group-active:bg-blue-50">
                      <span className={`block text-sm font-black ${ronda.puntos < 0 ? 'text-rojo-osc' : 'text-tinta'}`}>{formatearPuntos(ronda.puntos, true)}</span>
                      <span className="block text-[10px] font-semibold text-slate-400">acum. {formatearPuntos(ronda.acumulado)}</span>
                    </td>
                  ))}
                  <td className="whitespace-nowrap p-2 text-base font-black tabular-nums text-azul group-active:bg-blue-50">{formatearPuntos(fila.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
