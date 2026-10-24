import { useApp } from '../../estado/AppProvider';
import { subtituloParticipante } from '../../dominio/partida';
import { calcularEntrada, formatearPuntos } from '../../dominio/puntuacion';
import { EncabezadoModal, Modal } from '../../ui/Modal';

export function ModalAuditoria() {
  const { auditoria, cerrarAuditoria } = useApp();
  if (!auditoria) return null;

  const { partida, participanteId } = auditoria;
  const participante = partida.participantes.find((candidato) => candidato.id === participanteId);
  if (!participante) return null;

  let acumulado = 0;
  const filas = partida.rondas.map((ronda) => {
    const entrada = ronda.entradas[participante.id];
    const desglose = entrada ? calcularEntrada(entrada, partida.reglas) : null;
    acumulado += desglose?.total ?? 0;
    return { numero: ronda.numero, desglose, acumulado };
  });

  return (
    <Modal abierto onCerrar={cerrarAuditoria} ancho="max-w-md" zIndex="z-[75]" etiqueta="Desglose por ronda" cerrarAlHacerClickAfuera>
      <EncabezadoModal titulo={participante.nombre} subtitulo={subtituloParticipante(participante) || 'Desglose por ronda'} onCerrar={cerrarAuditoria} />
      <div className="scroll-oculto flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        <div className="flex shrink-0 items-end justify-between rounded-2xl bg-azul px-4 py-3 text-white">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total acumulado</span>
          <span className="text-3xl font-black leading-none tabular-nums">{formatearPuntos(filas.at(-1)?.acumulado ?? 0)}</span>
        </div>

        {filas.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Todavía no hay rondas cerradas.</p>}

        {filas.map((fila) => {
          const total = fila.desglose?.total ?? 0;
          const partes: [string, number][] = [
            ['🧺 Canastas', fila.desglose?.subtotalCanastas ?? 0],
            ['🃏 Cartas', fila.desglose?.subtotalCartas ?? 0],
            ['⭐ Bonos', fila.desglose?.subtotalBonos ?? 0],
            ['⚠️ Penalizaciones', fila.desglose?.subtotalPenalizaciones ?? 0],
          ];
          const conValor = partes.filter(([, puntos]) => puntos !== 0);
          const bonos = fila.desglose?.bonos ?? [];
          return (
            <article key={fila.numero} className="shrink-0 rounded-xl border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-display text-base font-black text-azul">Ronda {fila.numero}</span>
                <span className="text-right">
                  <strong className={`block text-lg font-black leading-tight tabular-nums ${total < 0 ? 'text-rojo-osc' : 'text-azul'}`}>{formatearPuntos(total, true)}</strong>
                  <span className="text-[10px] font-semibold text-slate-400">acum. {formatearPuntos(fila.acumulado)}</span>
                </span>
              </div>
              {conValor.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {conValor.map(([etiqueta, puntos]) => (
                    <li key={etiqueta} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                      {etiqueta} <strong className={puntos < 0 ? 'text-rojo-osc' : 'text-tinta'}>{formatearPuntos(puntos, true)}</strong>
                    </li>
                  ))}
                </ul>
              )}
              {bonos.length > 0 && (
                <p className="mt-2 text-xs text-slate-600" style={{ overflowWrap: 'anywhere' }}>
                  {bonos.map((linea, indice) => (
                    <span key={indice} className="mr-2 inline-block whitespace-nowrap">
                      {linea.clave === 'espejito' ? '🪞 ' : linea.clave === 'premio_canastas' ? '🧺 ' : ''}
                      {linea.etiqueta} <strong>{formatearPuntos(linea.puntos, true)}</strong>
                    </span>
                  ))}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </Modal>
  );
}
