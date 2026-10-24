import { CampoNumero } from '../../../ui/CampoNumero';
import { Toggle } from '../../../ui/Toggle';

interface Props {
  activo: boolean;
  cantidad: number | null;
  puntos: number | null;
  onCambiar: (cambios: { activo?: boolean; cantidad?: number | null; puntos?: number | null }) => void;
}

/** Misma grilla que el editor de mínimos para abrirse: etiqueta | campo de 110 px | unidad de 28 px. */
const GRILLA = 'grid items-center gap-2 [grid-template-columns:1fr_110px_28px]';

/** Premio extra al alcanzar o superar cierta cantidad de canastas en una ronda. */
export function EditorPremioCanastas({ activo, cantidad, puntos, onCambiar }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs leading-relaxed text-slate-500">
          Opcional. Si un jugador/equipo llega a la cantidad de canastas que elijas en una ronda, suma un premio extra (una sola vez por ronda).
        </p>
        <Toggle etiqueta="Premio por cantidad de canastas" checked={activo} onChange={(valor) => onCambiar({ activo: valor })} />
      </div>

      {activo && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <div className={GRILLA}>
            <span className="min-w-0 text-sm font-bold leading-tight text-slate-700">Al alcanzar o superar (canastas):</span>
            <CampoNumero valor={cantidad} onCambiar={(nuevo) => onCambiar({ cantidad: nuevo })} etiqueta="Cantidad de canastas para el premio" ancho={110} alto={42} />
            <span className="w-7 text-[10px] font-bold uppercase leading-none text-slate-500">can.</span>
          </div>
          <div className={`${GRILLA} border-t border-slate-200 pt-2.5`}>
            <span className="min-w-0 text-sm font-bold leading-tight text-slate-700">Premio extra:</span>
            <CampoNumero valor={puntos} onCambiar={(nuevo) => onCambiar({ puntos: nuevo })} etiqueta="Puntos de premio extra" ancho={110} alto={42} />
            <span className="w-7 text-sm font-bold text-slate-600">pts</span>
          </div>
        </div>
      )}
    </div>
  );
}
