import type { MouseEvent, ReactNode } from 'react';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: string;
  zIndex?: string;
  cerrarAlHacerClickAfuera?: boolean;
  etiqueta?: string;
  /** Desenfoca lo que hay detrás. Se apaga en modales que se abren encima de otro (el desenfoque apilado se ve con bandas negras en algunos celulares). */
  desenfocarFondo?: boolean;
}

export function Modal({
  abierto,
  onCerrar,
  children,
  ancho = 'max-w-sm',
  zIndex = 'z-50',
  cerrarAlHacerClickAfuera = false,
  etiqueta,
  desenfocarFondo = true,
}: Props) {
  if (!abierto) return null;

  const alTocarFondo = (evento: MouseEvent<HTMLDivElement>) => {
    if (!cerrarAlHacerClickAfuera) return;
    if (evento.target === evento.currentTarget) onCerrar();
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/70 p-3 ${desenfocarFondo ? 'backdrop-blur-sm' : ''} ${zIndex}`}
      onClick={alTocarFondo}
      role="dialog"
      aria-modal="true"
      aria-label={etiqueta}
    >
      <div className={`tarjeta entrar flex max-h-[90dvh] w-full ${ancho} flex-col overflow-hidden`}>{children}</div>
    </div>
  );
}

interface EncabezadoProps {
  titulo: string;
  subtitulo?: string;
  onCerrar: () => void;
  tono?: 'azul' | 'rojo';
}

export function EncabezadoModal({ titulo, subtitulo, onCerrar, tono = 'azul' }: EncabezadoProps) {
  const fondo = tono === 'rojo' ? 'bg-rojo-osc' : 'bg-azul';
  return (
    <div className={`flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white ${fondo}`}>
      <div className="min-w-0">
        <h3 className="truncate text-lg font-black leading-tight">{titulo}</h3>
        {subtitulo && <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/75">{subtitulo}</span>}
      </div>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl font-bold hover:bg-white/25"
      >
        ×
      </button>
    </div>
  );
}
