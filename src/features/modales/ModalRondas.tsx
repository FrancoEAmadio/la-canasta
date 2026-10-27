import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { subtituloParticipante } from '../../dominio/partida';
import { calcularEntrada, crearEntradaVacia, formatearPuntos } from '../../dominio/puntuacion';
import { EvolucionPartida } from '../../ui/EvolucionPartida';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import { ModalConfirmacion } from '../../ui/ModalConfirmacion';

export function ModalRondas() {
  const { rondasAbiertas, setRondasAbiertas, partida: estado } = useApp();
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const partida = estado.partidaActiva;
  if (!partida) return null;

  const { objetivo, borrador } = partida;
  const vista = estado.vista;
  // Corregir o deshacer reemplaza el borrador: solo se permite cuando la ronda en curso todavía no tiene nada cargado.
  const vacia = JSON.stringify(crearEntradaVacia());
  const borradorVacio = Object.values(borrador.entradas).every((entrada) => JSON.stringify(entrada) === vacia);
  const puedeEditar = borrador.paso === 'puntos' && borrador.editandoIdx === null && borradorVacio;
  const lider = vista ? Math.max(...vista.rankingCerrado.map((fila) => fila.puntos)) : 0;

  return (
    <>
      <Modal abierto={rondasAbiertas} onCerrar={() => setRondasAbiertas(false)} ancho="max-w-md" etiqueta="Historial de rondas" cerrarAlHacerClickAfuera>
        <EncabezadoModal titulo="📋 Tabla general y rondas" subtitulo="Posiciones, evolución y correcciones" onCerrar={() => setRondasAbiertas(false)} />
        <div className="scroll-oculto flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
          {!puedeEditar && partida.rondas.length > 0 && (
            <p className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
              Para corregir una ronda, primero terminá la carga de la ronda actual (o borrá lo que cargaste).
            </p>
          )}
          {vista && (
            <div className="rounded-xl border border-slate-200 p-3">
              <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-azul">Tabla general</h4>
              <ol className="flex flex-col gap-3">
                {vista.rankingCerrado.map(({ participante, puntos, posicion }) => {
                  const avance = objetivo ? Math.max(0, Math.min(100, (puntos / objetivo) * 100)) : 0;
                  return (
                    <li key={participante.id} className="flex flex-col gap-1.5">
                      <div className="fila-puntaje !items-end">
                        <div className="min-w-0 flex-1">
                          <span className="fila-puntaje-nombre font-display text-base font-black text-azul">
                            {posicion}. {participante.nombre}
                          </span>
                          {subtituloParticipante(participante) && <span className="fila-puntaje-nombre text-xs font-semibold text-slate-500">{subtituloParticipante(participante)}</span>}
                        </div>
                        <div className="fila-puntaje-valor">
                          <span className={`block text-2xl font-black leading-none tabular-nums ${puntos < 0 ? 'text-rojo-osc' : 'text-tinta'}`}>{formatearPuntos(puntos)}</span>
                        </div>
                      </div>
                      {objetivo !== null && (
                        <>
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                            <span>Meta {objetivo.toLocaleString('es-AR')} pts</span>
                            <span>{Math.round(avance)}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={Math.round(avance)} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance de ${participante.nombre} hacia ${objetivo} puntos`}>
                            <div className="h-full rounded-full bg-azul-vivo transition-all" style={{ width: `${avance}%` }} />
                          </div>
                        </>
                      )}
                      {puntos < lider && <span className="text-xs font-semibold text-slate-500">A {formatearPuntos(lider - puntos)} pts del líder</span>}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
          {partida.rondas.length === 0 && <p className="p-3 text-center text-sm text-slate-500">Todavía no cerraste ninguna ronda.</p>}
          {partida.rondas.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-3">
              <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-azul">Evolución de la partida</h4>
              <EvolucionPartida partida={partida} />
            </div>
          )}
          {partida.rondas.map((ronda, indice) => (
            <div key={ronda.numero} className="rounded-xl border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-base font-black text-azul">Ronda {ronda.numero}</span>
                <button
                  type="button"
                  disabled={!puedeEditar}
                  onClick={() => {
                    estado.iniciarEdicionRonda(indice);
                    setRondasAbiertas(false);
                  }}
                  className="btn-claro px-3 py-1.5 text-xs"
                >
                  ✏️ Corregir
                </button>
              </div>
              <ul className="flex flex-col gap-0.5 text-sm">
                {partida.participantes.map((participante) => {
                  const entrada = ronda.entradas[participante.id];
                  const desglose = entrada ? calcularEntrada(entrada, partida.reglas) : null;
                  const total = desglose?.total ?? 0;
                  const destacados = desglose?.bonos.filter((linea) => linea.clave) ?? [];
                  return (
                    <li key={participante.id} className="fila-puntaje !items-start">
                      <span className="min-w-0 flex-1">
                        <span className="fila-puntaje-nombre text-slate-700">{participante.nombre}</span>
                        {destacados.length > 0 && (
                          <span className="mt-0.5 flex flex-wrap gap-1">
                            {destacados.map((linea) => (
                              <span key={linea.clave} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-azul">
                                {linea.clave === 'espejito' ? '🪞' : '🧺'} {linea.etiqueta} {formatearPuntos(linea.puntos, true)}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                      <strong className={`fila-puntaje-valor ${total < 0 ? 'text-rojo-osc' : 'text-azul'}`}>{formatearPuntos(total, true)}</strong>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        {partida.rondas.length > 0 && (
          <div className="border-t border-slate-200 p-4">
            <button type="button" disabled={!puedeEditar} onClick={() => setConfirmarEliminar(true)} className="btn-secundario w-full py-3 text-sm">
              ↩ Deshacer última ronda
            </button>
          </div>
        )}
      </Modal>
      <ModalConfirmacion
        abierto={confirmarEliminar}
        titulo="Deshacer última ronda"
        descripcion={`¿Eliminar la ronda ${partida.rondas.length}?`}
        advertencia="Se borran los puntos cargados en esa ronda."
        textoConfirmar="Deshacer"
        zIndex="z-[80]"
        onCancelar={() => setConfirmarEliminar(false)}
        onConfirmar={() => {
          estado.eliminarUltimaRonda();
          setConfirmarEliminar(false);
          setRondasAbiertas(false);
        }}
      />
    </>
  );
}
