import { PALOS } from '../dominio/estadisticas';
import type { Palo } from '../tipos';
import { NOMBRE_PALO, SimboloPalo } from './SimboloPalo';

export function SelectorPalo({ valor, onCambiar }: { valor: Palo; onCambiar: (palo: Palo) => void }) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Ícono de palo">
      {PALOS.map((palo) => (
        <button
          key={palo}
          type="button"
          role="radio"
          aria-checked={valor === palo}
          aria-label={NOMBRE_PALO[palo]}
          onClick={() => onCambiar(palo)}
          className={`flex h-11 flex-1 items-center justify-center rounded-xl border-2 ${
            valor === palo ? 'border-azul-vivo bg-blue-50 shadow-inner' : 'border-slate-200 bg-white'
          }`}
        >
          <SimboloPalo palo={palo} className="h-6 w-6" />
        </button>
      ))}
    </div>
  );
}
