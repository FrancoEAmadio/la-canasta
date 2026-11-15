import { vibrar } from '../infra/vibracion';

export type TonoChip = 'azul' | 'rojo';

interface Props {
  titulo: string;
  /** Puntos que aporta (o aportaría) el bono, ya formateados. */
  puntos: string;
  cantidad: number;
  maximo: number;
  tono?: TonoChip;
  /** Línea chica debajo (ej.: "Lo tiene Martina"). */
  aviso?: string;
  onMas: () => void;
  onBorrar: () => void;
}

const TONOS: Record<TonoChip, { reposo: string; activo: string; insignia: string }> = {
  azul: {
    reposo: 'bg-slate-50 border-slate-200 text-slate-500',
    activo: 'bg-blue-50 border-azul-vivo text-azul ring-2 ring-blue-200',
    insignia: 'bg-azul-vivo text-white',
  },
  rojo: {
    reposo: 'bg-slate-50 border-slate-200 text-slate-500',
    activo: 'bg-red-50 border-rojo text-rojo-osc ring-2 ring-red-200',
    insignia: 'bg-rojo text-white',
  },
};

/**
 * Botón-chip de toque (igual que en Skull King): gris = no lo tiene; un toque lo prende;
 * si admite más de uno, cada toque suma hasta el máximo y el siguiente lo vuelve a 0.
 */
export function ChipBono({ titulo, puntos, cantidad, maximo, tono = 'azul', aviso, onMas, onBorrar }: Props) {
  const activo = cantidad > 0;
  const bloqueado = maximo <= 0 && cantidad === 0;
  const clases = TONOS[tono];
  return (
    <button
      type="button"
      aria-pressed={activo}
      aria-label={`${titulo}${maximo > 1 ? `: ${cantidad} de ${maximo}` : ''}`}
      disabled={bloqueado}
      onClick={() => {
        vibrar();
        if (cantidad >= maximo) onBorrar();
        else onMas();
      }}
      className={`relative flex min-h-[4.25rem] w-full flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-2 text-center disabled:opacity-35 ${
        activo ? clases.activo : clases.reposo
      }`}
    >
      <span className={`text-sm font-bold leading-tight ${activo ? '' : 'text-tinta'}`}>{titulo}</span>
      <span className="text-xs font-bold tabular-nums leading-tight">{puntos}</span>
      {aviso && <span className="text-[10px] font-semibold leading-tight text-amber-700">{aviso}</span>}
      {activo && maximo > 1 && (
        <span className={`absolute -right-1.5 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold shadow ${clases.insignia}`}>
          ×{cantidad}
        </span>
      )}
    </button>
  );
}
