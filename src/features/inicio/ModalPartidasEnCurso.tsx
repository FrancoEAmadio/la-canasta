import { useState } from 'react';
import { calcularRanking, formatearFecha, subtituloParticipante } from '../../dominio/partida';
import { formatearPuntos } from '../../dominio/puntuacion';
import { useApp } from '../../estado/AppProvider';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import { ModalConfirmacion } from '../../ui/ModalConfirmacion';
import type { Partida } from '../../tipos';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

/** Lista las partidas en curso para elegir cuál continuar (o descartar las que ya no se van a seguir jugando). */
export function ModalPartidasEnCurso({ abierto, onCerrar }: Props) {
  const { partida: estado } = useApp();
  const [aDescartar, setADescartar] = useState<Partida | null>(null);
  const lista = estado.enCurso;

  const continuar = (id: string) => {
    onCerrar();
    estado.reanudarPartida(id);
  };

  return (
    <>
      <Modal abierto={abierto} onCerrar={onCerrar} ancho="max-w-md" etiqueta="Partidas en curso" cerrarAlHacerClickAfuera>
        <EncabezadoModal titulo="Partidas en curso" subtitulo={`${lista.length} para continuar`} onCerrar={onCerrar} />
        <div className="scroll-oculto flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {lista.length === 0 && <p className="p-4 text-center text-sm text-slate-500">No hay partidas en curso.</p>}
          {lista.map((item) => {
            const ranking = calcularRanking(item);
            return (
              <article key={item.id} className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase text-amber-800">
                    Ronda {item.borrador.numero} · {item.modo === 'parejas' ? '🤝 Parejas' : '🙋 Individual'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">{formatearFecha(item.actualizada)}</span>
                </header>

                <p className="text-xs font-semibold text-slate-500">
                  {item.reglas.mazos} mazos · {item.objetivo === null ? 'sin límite de puntos' : `meta ${item.objetivo.toLocaleString('es-AR')} pts`}
                </p>

                <ul className="flex flex-col gap-1">
                  {ranking.map((fila) => (
                    <li key={fila.participante.id} className="fila-puntaje rounded-lg bg-white px-2.5 py-1.5 text-sm">
                      <span className="min-w-0 flex-1">
                        <span className="fila-puntaje-nombre font-bold text-tinta">{fila.participante.nombre}</span>
                        {subtituloParticipante(fila.participante) && (
                          <span className="fila-puntaje-nombre text-[11px] font-semibold text-slate-500">{subtituloParticipante(fila.participante)}</span>
                        )}
                      </span>
                      <strong className={`fila-puntaje-valor ${fila.puntos < 0 ? 'text-rojo-osc' : 'text-azul'}`}>{formatearPuntos(fila.puntos)}</strong>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <button type="button" onClick={() => continuar(item.id)} className="btn-primario py-3 text-sm">
                    ▶ Continuar
                  </button>
                  <button type="button" onClick={() => setADescartar(item)} aria-label="Descartar esta partida" className="btn-claro px-4 py-3 text-base">
                    🗑️
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </Modal>

      <ModalConfirmacion
        abierto={aDescartar !== null}
        titulo="Descartar partida"
        descripcion="¿Descartar esta partida en curso?"
        advertencia="Se pierde todo lo cargado y no queda en el historial ni en las estadísticas."
        textoConfirmar="Descartar"
        zIndex="z-[80]"
        onCancelar={() => setADescartar(null)}
        onConfirmar={() => {
          if (aDescartar) estado.eliminarPartida(aDescartar.id);
          setADescartar(null);
          if (lista.length <= 1) onCerrar();
        }}
      />
    </>
  );
}
