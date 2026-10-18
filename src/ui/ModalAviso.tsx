import type { ReactNode } from 'react';
import { EncabezadoModal, Modal } from './Modal';

interface Props {
  abierto: boolean;
  titulo: string;
  mensaje: ReactNode;
  onCerrar: () => void;
  textoBoton?: string;
  zIndex?: string;
}

export function ModalAviso({ abierto, titulo, mensaje, onCerrar, textoBoton = 'Entendido', zIndex = 'z-[70]' }: Props) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} ancho="max-w-xs" zIndex={zIndex} etiqueta={titulo} cerrarAlHacerClickAfuera>
      <EncabezadoModal titulo={titulo} onCerrar={onCerrar} />
      <div className="p-5 text-center text-sm leading-relaxed text-slate-700">{mensaje}</div>
      <div className="border-t border-slate-200 p-4">
        <button type="button" onClick={onCerrar} className="btn-primario w-full py-3 text-sm">
          {textoBoton}
        </button>
      </div>
    </Modal>
  );
}
