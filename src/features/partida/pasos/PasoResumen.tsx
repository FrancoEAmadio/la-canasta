import type { ReactNode } from 'react';
import { requisitoApertura } from '../../../dominio/apertura';
import { subtituloParticipante } from '../../../dominio/partida';
import { formatearPuntos } from '../../../dominio/puntuacion';
import { useApp } from '../../../estado/AppProvider';
import type { LineaDesglose } from '../../../tipos';
import type { PropsPaso } from './tiposPaso';

function Grupo({ titulo, lineas, subtotal, negativo = false }: { titulo: string; lineas: LineaDesglose[]; subtotal: number; negativo?: boolean }): ReactNode {
  if (lineas.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-black uppercase tracking-wider ${negativo ? 'text-rojo-osc' : 'text-azul'}`}>{titulo}</span>
        <span className={`text-sm font-black tabular-nums ${negativo ? 'text-rojo-osc' : 'text-azul'}`}>{formatearPuntos(subtotal, true)}</span>
      </div>
      {lineas.map((linea, indice) => (
        <div key={`${linea.etiqueta}-${indice}`} className={`flex justify-between rounded-lg px-2.5 py-1 text-xs ${negativo ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-slate-700'}`}>
          <span>
            {linea.etiqueta}
            {linea.cantidad !== undefined && linea.cantidad > 1 ? ` ×${linea.cantidad}` : ''}
          </span>
          <span className="font-bold tabular-nums">{formatearPuntos(linea.puntos, true)}</span>
        </div>
      ))}
    </div>
  );
}

export function PasoResumen({ partida, vista }: PropsPaso) {
  const { partida: estado, abrirPodio } = useApp();
  const editando = partida.borrador.editandoIdx !== null;

  const confirmarFinal = () => {
    if (estado.finalizarPartida(true)) abrirPodio(partida.id);
  };

  return (
    <section className="entrar flex flex-col gap-4">
      <div className="tarjeta tarjeta-acento-azul p-4">
        <span className="block text-xs font-black uppercase text-azul">Resumen de la ronda {vista.numeroRonda}</span>
        <span className="mt-0.5 block text-xs text-slate-500">
          {editando ? 'Estás corrigiendo una ronda anterior: revisá y guardá los cambios.' : 'Revisá los puntos antes de confirmar. Podés volver a corregir cualquier dato.'}
        </span>
      </div>

      {vista.advertencias.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <span className="mb-1 block text-sm font-black text-amber-900">⚠️ Revisá estos puntos</span>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-xs text-amber-900">
            {vista.advertencias.map((texto) => (
              <li key={texto}>{texto}</li>
            ))}
          </ul>
        </div>
      )}

      {partida.participantes.map((participante) => {
        const desglose = vista.desgloses[participante.id]!;
        const acumulado = vista.totalesConBorrador[participante.id] ?? 0;
        return (
          <article key={participante.id} className="tarjeta flex flex-col gap-3 p-4">
            <header className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="min-w-0">
                <h3 className="truncate font-display text-lg font-black text-azul">{participante.nombre}</h3>
                {subtituloParticipante(participante) && <span className="block truncate text-xs font-semibold text-slate-500">{subtituloParticipante(participante)}</span>}
              </div>
            </header>

            <Grupo titulo="Canastas" lineas={desglose.canastas} subtotal={desglose.subtotalCanastas} />
            <Grupo titulo="Cartas en mesa" lineas={desglose.cartas} subtotal={desglose.subtotalCartas} />
            <Grupo titulo="Bonos" lineas={desglose.bonos} subtotal={desglose.subtotalBonos} />
            <Grupo titulo="Penalizaciones" lineas={desglose.penalizaciones} subtotal={desglose.subtotalPenalizaciones} negativo />
            {desglose.canastas.length + desglose.cartas.length + desglose.bonos.length + desglose.penalizaciones.length === 0 && (
              <p className="text-center text-xs text-slate-400">Sin puntos cargados en esta ronda.</p>
            )}

            <p className="rounded-xl bg-slate-100 px-3 py-2 text-center text-[11px] font-semibold tabular-nums text-slate-600">
              {formatearPuntos(desglose.subtotalCanastas)} canastas + {formatearPuntos(desglose.subtotalCartas)} cartas + {formatearPuntos(desglose.subtotalBonos)} bonos − {formatearPuntos(Math.abs(desglose.subtotalPenalizaciones))} penalizaciones
            </p>

            <div className="flex items-end justify-between border-t border-slate-200 pt-3">
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-400">Puntaje de la ronda</span>
                <span className={`text-2xl font-black tabular-nums ${desglose.total < 0 ? 'text-rojo-osc' : 'text-azul'}`}>{formatearPuntos(desglose.total, true)}</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold uppercase text-slate-400">Nuevo acumulado</span>
                <span className="text-3xl font-black tabular-nums text-tinta">{formatearPuntos(acumulado)}</span>
                <span className="block text-[11px] font-bold text-azul">Próximo mínimo para abrirse: {requisitoApertura(acumulado, partida.reglas.apertura)} pts</span>
              </div>
            </div>
          </article>
        );
      })}

      <div className="pie-seguro grid gap-2">
        {vista.meta ? (
          <>
            <button type="button" onClick={confirmarFinal} className="btn-secundario w-full py-4 text-lg">
              🏁 Confirmar resultado final
            </button>
            {!editando && (
              <button type="button" onClick={() => estado.confirmarRonda()} className="btn-fantasma w-full py-3 text-sm">
                Seguir jugando igualmente
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={() => estado.confirmarRonda()} className="btn-secundario w-full py-4 text-lg">
            {editando ? 'Guardar corrección ✓' : 'Confirmar ronda y seguir ➔'}
          </button>
        )}
        <button type="button" onClick={() => estado.irAPaso('puntos')} className="btn-fantasma w-full py-3 text-sm">
          ← Corregir puntos
        </button>
      </div>
    </section>
  );
}
