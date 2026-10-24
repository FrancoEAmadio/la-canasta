import { useState } from 'react';
import { aperturaValida } from '../../dominio/apertura';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import { EditorApertura } from '../partida/componentes/EditorApertura';
import { EditorPremioCanastas } from '../partida/componentes/EditorPremioCanastas';
import type { Partida } from '../../tipos';

interface Props {
  partida: Partida;
  onGuardar: (cambios: Pick<Partida['reglas'], 'apertura' | 'premioCanastas'>) => void;
  onCerrar: () => void;
}

/** Cambia durante la partida los mínimos para abrirse y el premio por canastas (afecta a todas las rondas, también a las ya cargadas). */
export function ModalReglasPartida({ partida, onGuardar, onCerrar }: Props) {
  const { reglas } = partida;
  const [umbrales, setUmbrales] = useState<(number | null)[]>(reglas.apertura.umbrales);
  const [requisitos, setRequisitos] = useState<(number | null)[]>(reglas.apertura.requisitos);
  const [premioActivo, setPremioActivo] = useState(reglas.premioCanastas.activo);
  const [premioCantidad, setPremioCantidad] = useState<number | null>(reglas.premioCanastas.cantidad);
  const [premioPuntos, setPremioPuntos] = useState<number | null>(reglas.premioCanastas.puntos);

  const candidata = { umbrales: umbrales as number[], requisitos: requisitos as number[] };
  const aperturaOk = !umbrales.includes(null) && !requisitos.includes(null) && aperturaValida(candidata);
  const premioOk = !premioActivo || (premioCantidad !== null && premioCantidad >= 1 && premioPuntos !== null && premioPuntos >= 0);
  const valida = aperturaOk && premioOk;

  return (
    <Modal abierto onCerrar={onCerrar} ancho="max-w-md" etiqueta="Ajustes de reglas de la partida" cerrarAlHacerClickAfuera>
      <EncabezadoModal titulo="Reglas de la partida" subtitulo="Mínimos y premio por canastas" onCerrar={onCerrar} />
      <div className="scroll-oculto flex flex-col gap-4 overflow-y-auto p-4">
        <section className="flex flex-col gap-2">
          <h4 className="text-sm font-black uppercase tracking-wider text-azul">🔓 Mínimos para abrirse</h4>
          <EditorApertura
            umbrales={umbrales}
            requisitos={requisitos}
            onCambiar={(nuevosUmbrales, nuevosRequisitos) => {
              setUmbrales(nuevosUmbrales);
              setRequisitos(nuevosRequisitos);
            }}
          />
          {!aperturaOk && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Completá todos los campos; los límites de puntaje tienen que ir de menor a mayor.</p>}
        </section>

        <section className="flex flex-col gap-2">
          <h4 className="text-sm font-black uppercase tracking-wider text-azul">🧺 Premio por cantidad de canastas</h4>
          <EditorPremioCanastas
            activo={premioActivo}
            cantidad={premioCantidad}
            puntos={premioPuntos}
            onCambiar={(cambios) => {
              if (cambios.activo !== undefined) setPremioActivo(cambios.activo);
              if (cambios.cantidad !== undefined) setPremioCantidad(cambios.cantidad);
              if (cambios.puntos !== undefined) setPremioPuntos(cambios.puntos);
            }}
          />
          {reglas.premiosHeredados && !premioActivo && (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-azul">Esta partida usa los premios clásicos (Canastrón con 5 canastas y Canasta de canastas con 7). Si activás el premio de arriba, los reemplaza.</p>
          )}
          {!premioOk && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Completá la cantidad de canastas y los puntos del premio.</p>}
        </section>

        <p className="text-xs text-slate-500">Los cambios se aplican a toda la partida, también a las rondas que ya cargaste.</p>
      </div>
      <div className="flex flex-col gap-2 border-t border-slate-200 p-4">
        <button
          type="button"
          disabled={!valida}
          onClick={() => {
            onGuardar({
              apertura: candidata,
              premioCanastas: { activo: premioActivo, cantidad: premioCantidad ?? reglas.premioCanastas.cantidad, puntos: premioPuntos ?? reglas.premioCanastas.puntos },
            });
            onCerrar();
          }}
          className="btn-primario w-full py-3.5 text-base"
        >
          Guardar
        </button>
        <button type="button" onClick={onCerrar} className="btn-claro w-full py-2.5 text-sm">
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
