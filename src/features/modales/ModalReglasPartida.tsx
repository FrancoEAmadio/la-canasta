import { useState } from 'react';
import { aperturaValida } from '../../dominio/apertura';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import { EditorApertura } from '../partida/componentes/EditorApertura';
import type { Partida } from '../../tipos';

interface Props {
  partida: Partida;
  onGuardar: (apertura: Partida['reglas']['apertura']) => void;
  onCerrar: () => void;
}

/** Cambia durante la partida los puntos mínimos para abrirse (afecta a todas las rondas, también a las ya cargadas). */
export function ModalReglasPartida({ partida, onGuardar, onCerrar }: Props) {
  const [umbrales, setUmbrales] = useState<(number | null)[]>(partida.reglas.apertura.umbrales);
  const [requisitos, setRequisitos] = useState<(number | null)[]>(partida.reglas.apertura.requisitos);

  const candidata = { umbrales: umbrales as number[], requisitos: requisitos as number[] };
  const valida = !umbrales.includes(null) && !requisitos.includes(null) && aperturaValida(candidata);

  return (
    <Modal abierto onCerrar={onCerrar} ancho="max-w-md" etiqueta="Ajustes de reglas de la partida" cerrarAlHacerClickAfuera>
      <EncabezadoModal titulo="Reglas de la partida" subtitulo="Mínimos para abrirse" onCerrar={onCerrar} />
      <div className="flex flex-col gap-3 overflow-y-auto p-4">
        <EditorApertura
          umbrales={umbrales}
          requisitos={requisitos}
          onCambiar={(nuevosUmbrales, nuevosRequisitos) => {
            setUmbrales(nuevosUmbrales);
            setRequisitos(nuevosRequisitos);
          }}
        />
        {!valida && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Completá todos los campos; los límites de puntaje tienen que ir de menor a mayor.</p>}
        <p className="text-xs text-slate-500">El mínimo se calcula con el puntaje acumulado de cada jugador/equipo al inicio de cada ronda.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 p-4">
        <button type="button" onClick={onCerrar} className="btn-fantasma py-3 text-sm">
          Cancelar
        </button>
        <button
          type="button"
          disabled={!valida}
          onClick={() => {
            onGuardar(candidata);
            onCerrar();
          }}
          className="btn-primario py-3 text-sm"
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}
