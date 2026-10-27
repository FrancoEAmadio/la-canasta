import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { calcularEntrada, crearEntradaVacia, formatearPuntos } from '../../dominio/puntuacion';
import { ModalConfirmacion } from '../../ui/ModalConfirmacion';

interface Props {
  /** Se llama al elegir «Corregir» o «Deshacer», para cerrar el modal que contiene el historial. */
  alCambiarRonda: () => void;
}

/** Rondas cerradas de la partida activa, con acceso a corregirlas y a deshacer la última. */
export function HistorialRondas({ alCambiarRonda }: Props) {
  const { partida: estado } = useApp();
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const partida = estado.partidaActiva;
  if (!partida || partida.rondas.length === 0) return null;

  const { borrador } = partida;
  // Corregir o deshacer reemplaza el borrador: solo se permite cuando la ronda en curso todavía no tiene nada cargado.
  const vacia = JSON.stringify(crearEntradaVacia());
  const borradorVacio = Object.values(borrador.entradas).every((entrada) => JSON.stringify(entrada) === vacia);
  const puedeEditar = borrador.paso === 'puntos' && borrador.editandoIdx === null && borradorVacio;

  return (
    <>
      <div className="mt-2 flex shrink-0 flex-col gap-2.5 rounded-2xl border border-slate-200 p-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-azul">Rondas jugadas</h4>
        {!puedeEditar && (
          <p className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
            Para corregir una ronda, primero terminá la carga de la ronda actual (o borrá lo que cargaste).
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
                  alCambiarRonda();
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
        <button type="button" disabled={!puedeEditar} onClick={() => setConfirmarEliminar(true)} className="btn-secundario w-full py-3 text-sm">
          ↩ Deshacer última ronda
        </button>
      </div>
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
          alCambiarRonda();
        }}
      />
    </>
  );
}
