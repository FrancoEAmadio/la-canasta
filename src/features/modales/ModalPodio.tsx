import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { calcularRanking, subtituloParticipante } from '../../dominio/partida';
import { calcularEntrada, formatearPuntos } from '../../dominio/puntuacion';
import { compartirTexto, textoResultado } from '../../infra/compartir';
import { GraficoEvolucion } from '../../ui/GraficoEvolucion';
import type { SerieGrafico } from '../../ui/GraficoEvolucion';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import { ModalAviso } from '../../ui/ModalAviso';
import type { Partida } from '../../tipos';

function construirSeries(partida: Partida): SerieGrafico[] {
  return partida.participantes.map((participante) => {
    let acumulado = 0;
    const puntos = [0];
    for (const ronda of partida.rondas) {
      const entrada = ronda.entradas[participante.id];
      if (entrada) acumulado += calcularEntrada(entrada, partida.reglas).total;
      puntos.push(acumulado);
    }
    return { nombre: participante.nombre, puntos };
  });
}

export function ModalPodio() {
  const { podioPartidaId, cerrarPodio, partida: estado, verAuditoria } = useApp();
  const [aviso, setAviso] = useState<string | null>(null);
  const partida = estado.partidas.find((candidata) => candidata.id === podioPartidaId) ?? null;

  if (!partida) return null;
  const finalizada = partida.estado === 'finalizada';
  const ranking = calcularRanking(partida);
  const series = construirSeries(partida);

  const compartir = async () => {
    const resultado = await compartirTexto('La Canasta', textoResultado(partida));
    if (resultado === 'copiado') setAviso('Resultado copiado al portapapeles.');
    if (resultado === 'error') setAviso('No se pudo compartir en este dispositivo.');
  };

  return (
    <>
      <Modal abierto onCerrar={cerrarPodio} ancho="max-w-sm" zIndex="z-[55]" etiqueta="Tabla general de puntos" cerrarAlHacerClickAfuera={!finalizada}>
        <EncabezadoModal titulo={finalizada ? '🏆 Resultado final' : '🏆 Tabla general'} subtitulo={`${partida.rondas.length} ronda${partida.rondas.length === 1 ? '' : 's'} jugada${partida.rondas.length === 1 ? '' : 's'}`} onCerrar={cerrarPodio} />

        <div className="scroll-oculto flex flex-1 flex-col gap-2 overflow-y-auto p-4">
          {ranking.map((fila) => (
            <button
              key={fila.participante.id}
              type="button"
              onClick={() => verAuditoria(partida, fila.participante.id)}
              className={`flex items-center justify-between rounded-xl border p-3 text-left ${
                fila.posicion === 1 ? 'border-azul bg-azul text-white' : 'border-slate-200 bg-slate-50 text-tinta'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="w-7 text-center text-xl font-black">{['🥇', '🥈', '🥉'][fila.posicion - 1] ?? `${fila.posicion}.`}</span>
                <span className="min-w-0">
                  <span className="block truncate font-black">{fila.participante.nombre}</span>
                  {subtituloParticipante(fila.participante) && (
                    <span className="block truncate text-[11px] font-semibold opacity-80">{subtituloParticipante(fila.participante)}</span>
                  )}
                  <span className="block text-[10px] opacity-70">🔍 Ver desglose</span>
                </span>
              </span>
              <span className="text-xl font-black">{formatearPuntos(fila.puntos)}</span>
            </button>
          ))}

          <div className="mt-2 rounded-xl border border-slate-200 p-3">
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-azul">Evolución por ronda</h4>
            {partida.rondas.length >= 1 ? <GraficoEvolucion series={series} /> : <p className="text-xs text-slate-500">Todavía no hay rondas cerradas.</p>}
          </div>
        </div>

        <div className="grid gap-2 border-t border-slate-200 p-4">
          <button type="button" onClick={() => void compartir()} className="btn-claro py-3 text-sm">
            📤 Compartir resultado
          </button>
          <button type="button" onClick={cerrarPodio} className="btn-primario py-3.5 text-base">
            {finalizada ? '🏁 Finalizar y guardar' : '← Volver'}
          </button>
        </div>
      </Modal>
      <ModalAviso abierto={aviso !== null} titulo="Compartir" mensaje={aviso} onCerrar={() => setAviso(null)} textoBoton="OK" zIndex="z-[80]" />
    </>
  );
}
