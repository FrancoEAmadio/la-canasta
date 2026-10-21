import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { calcularEntrada, formatearPuntos } from '../../dominio/puntuacion';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import { ModalConfirmacion } from '../../ui/ModalConfirmacion';

export function ModalRondas() {
  const { rondasAbiertas, setRondasAbiertas, partida: estado } = useApp();
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const partida = estado.partidaActiva;
  if (!partida) return null;

  const puedeEditar = partida.borrador.paso === 'mesa' && partida.borrador.editandoIdx === null;

  return (
    <>
      <Modal abierto={rondasAbiertas} onCerrar={() => setRondasAbiertas(false)} ancho="max-w-md" etiqueta="Historial de rondas" cerrarAlHacerClickAfuera>
        <EncabezadoModal titulo="📋 Rondas jugadas" subtitulo="Corregí cualquier ronda cerrada" onCerrar={() => setRondasAbiertas(false)} />
        <div className="scroll-oculto flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
          {partida.rondas.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Todavía no cerraste ninguna ronda.</p>}
          {!puedeEditar && partida.rondas.length > 0 && (
            <p className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
              Para corregir una ronda volvé primero al paso «1. Mesa» (o terminá la carga actual).
            </p>
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
                  const total = entrada ? calcularEntrada(entrada, partida.reglas).total : 0;
                  return (
                    <li key={participante.id} className="fila-puntaje !items-start">
                      <span className="fila-puntaje-nombre min-w-0 flex-1 text-slate-700">{participante.nombre}</span>
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
