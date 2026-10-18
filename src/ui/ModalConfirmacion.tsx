import type { ReactNode } from 'react';
import { EncabezadoModal, Modal } from './Modal';

interface Props {
  abierto: boolean;
  titulo: string;
  descripcion: ReactNode;
  advertencia?: ReactNode;
  textoConfirmar: string;
  textoCancelar?: string;
  /** 'peligro' pinta el botón de rojo; 'normal' lo deja azul. */
  tono?: 'peligro' | 'normal';
  onCancelar: () => void;
  onConfirmar: () => void;
  zIndex?: string;
}

export function ModalConfirmacion({
  abierto,
  titulo,
  descripcion,
  advertencia,
  textoConfirmar,
  textoCancelar = 'Cancelar',
  tono = 'peligro',
  onCancelar,
  onConfirmar,
  zIndex = 'z-[70]',
}: Props) {
  return (
    <Modal abierto={abierto} onCerrar={onCancelar} ancho="max-w-sm" zIndex={zIndex} etiqueta={titulo} cerrarAlHacerClickAfuera>
      <EncabezadoModal titulo={titulo} onCerrar={onCancelar} tono={tono === 'peligro' ? 'rojo' : 'azul'} />
      <div className="flex flex-col gap-3 p-5">
        <div className="text-base font-bold text-slate-900">{descripcion}</div>
        {advertencia && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-relaxed text-red-800">{advertencia}</div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5 border-t border-slate-200 p-4">
        <button type="button" onClick={onCancelar} className="btn-claro py-3 text-sm">
          {textoCancelar}
        </button>
        <button type="button" onClick={onConfirmar} className={`${tono === 'peligro' ? 'btn-secundario' : 'btn-primario'} py-3 text-sm`}>
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
