import { PALETA_JUGADOR } from '../datos/coloresJugador';
import { vibrar } from '../infra/vibracion';

interface Props {
  valor: string;
  onCambiar: (color: string) => void;
  /** Colores que ya usan otros jugadores (se ven tachados, pero se pueden elegir igual). */
  ocupados?: string[];
}

/** Fila de 9 colores para elegir el color propio del jugador. */
export function SelectorColor({ valor, onCambiar, ocupados = [] }: Props) {
  return (
    <div className="grid grid-cols-9 gap-1.5" role="radiogroup" aria-label="Color del jugador">
      {PALETA_JUGADOR.map((color) => {
        const activo = color.id === valor;
        const ocupado = !activo && ocupados.includes(color.id);
        return (
          <button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={activo}
            aria-label={`${color.nombre}${ocupado ? ' (ya lo usa otro jugador)' : ''}`}
            onClick={() => {
              vibrar();
              onCambiar(color.id);
            }}
            className={`relative aspect-square w-full rounded-full border-2 ${activo ? 'border-tinta ring-2 ring-slate-300' : 'border-white'} ${ocupado ? 'opacity-35' : ''}`}
            style={{ backgroundColor: color.hex }}
          >
            {activo && <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
