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
      <div className="scroll-oculto flex-1 overflow-auto p-3">
        {filas.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">Todavía no hay rondas cerradas.</p>
        ) : (
          <table className="w-full min-w-[22rem] border-collapse text-right text-xs">
            <thead>
              <tr className="text-[10px] uppercase text-slate-500">
                <th className="p-1.5 text-left">Ronda</th>
                <th className="p-1.5">Canastas</th>
                <th className="p-1.5">Cartas</th>
                <th className="p-1.5">Bonos</th>
                <th className="p-1.5">Penal.</th>
                <th className="p-1.5">Total</th>
                <th className="p-1.5">Acum.</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.numero} className="border-t border-slate-100 text-tinta">
                  <td className="p-1.5 text-left font-black">R{fila.numero}</td>
                  <td className="p-1.5">{formatearPuntos(fila.desglose?.subtotalCanastas ?? 0)}</td>
                  <td className="p-1.5">{formatearPuntos(fila.desglose?.subtotalCartas ?? 0)}</td>
                  <td className="p-1.5">{formatearPuntos(fila.desglose?.subtotalBonos ?? 0)}</td>
                  <td className="p-1.5 text-rojo-osc">{formatearPuntos(fila.desglose?.subtotalPenalizaciones ?? 0)}</td>
                  <td className={`p-1.5 font-black ${(fila.desglose?.total ?? 0) < 0 ? 'text-rojo-osc' : 'text-azul'}`}>{formatearPuntos(fila.desglose?.total ?? 0, true)}</td>
                  <td className="p-1.5 font-black">{formatearPuntos(fila.acumulado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
}
