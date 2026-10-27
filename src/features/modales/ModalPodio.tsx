import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { calcularRanking, subtituloParticipante } from '../../dominio/partida';
import { formatearPuntos } from '../../dominio/puntuacion';
import { compartirTexto, textoResultado } from '../../infra/compartir';
import { EvolucionPartida } from '../../ui/EvolucionPartida';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import { ModalAviso } from '../../ui/ModalAviso';
import { HistorialRondas } from './HistorialRondas';

export function ModalPodio() {
  const { podioPartidaId, cerrarPodio, partida: estado, verAuditoria } = useApp();
  const [aviso, setAviso] = useState<string | null>(null);
  const partida = estado.partidas.find((candidata) => candidata.id === podioPartidaId) ?? null;

  if (!partida) return null;
  const finalizada = partida.estado === 'finalizada';
  const ranking = calcularRanking(partida);
  const lider = ranking[0]?.puntos ?? 0;
  const { objetivo } = partida;

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
          {ranking.map((fila) => {
            const primero = fila.posicion === 1;
            const avance = objetivo !== null ? Math.max(0, Math.min(100, (fila.puntos / objetivo) * 100)) : 0;
            return (
              <button
                key={fila.participante.id}
                type="button"
                onClick={() => verAuditoria(partida, fila.participante.id)}
                aria-label={`Ver el desglose de ${fila.participante.nombre}`}
                className={`grid shrink-0 grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left ${
                  primero ? 'border-azul bg-azul text-white' : 'border-slate-200 bg-slate-50 text-tinta'
                }`}
              >
                <span className="w-8 text-center text-2xl font-black leading-none">{['🥇', '🥈', '🥉'][fila.posicion - 1] ?? `${fila.posicion}.`}</span>

                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-base font-black leading-tight" style={{ overflowWrap: 'anywhere' }}>
                    {fila.participante.nombre}
                  </span>
                  {subtituloParticipante(fila.participante) && (
                    <span className="text-[11px] font-semibold leading-tight opacity-80" style={{ overflowWrap: 'anywhere' }}>
                      {subtituloParticipante(fila.participante)}
                    </span>
                  )}
                  {objetivo !== null && (
                    <span
                      className={`block h-1.5 overflow-hidden rounded-full ${primero ? 'bg-white/25' : 'bg-slate-200'}`}
                      role="progressbar"
                      aria-valuenow={Math.round(avance)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Avance hacia ${objetivo} puntos`}
                    >
                      <span className={`block h-full rounded-full ${primero ? 'bg-white' : 'bg-azul-vivo'}`} style={{ width: `${avance}%` }} />
                    </span>
                  )}
                  {fila.puntos < lider && <span className="text-xs font-semibold leading-tight opacity-75">A {formatearPuntos(lider - fila.puntos)} pts del líder</span>}
                </span>

                <span className="whitespace-nowrap text-right text-2xl font-black tabular-nums">{formatearPuntos(fila.puntos)}</span>
                <span aria-hidden="true" className="flex flex-col items-center text-[10px] font-bold uppercase leading-tight opacity-70">
                  <span className="text-xl font-black leading-none">›</span>
                  Desglose
                </span>
              </button>
            );
          })}

          <div className="mt-2 shrink-0 rounded-2xl border border-slate-200 p-4">
            <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-azul">Evolución por ronda</h4>
            <EvolucionPartida partida={partida} sinDesglose />
          </div>

          {/* Corregir / deshacer rondas: solo en la partida que se está jugando. */}
          {!finalizada && estado.partidaActiva?.id === partida.id && <HistorialRondas alCambiarRonda={cerrarPodio} />}
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
