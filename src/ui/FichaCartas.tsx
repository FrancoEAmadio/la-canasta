import { vibrar } from '../infra/vibracion';

interface Props {
  /** Valor de cada carta (5, 10, 20, 50 o 100 para los Tres Negros). */
  valor: number;
  titulo: string;
  ejemplo: string;
  cantidad: number;
  max: number;
  tono?: 'azul' | 'rojo';
  deshabilitado?: boolean;
  onCambiar: (nuevo: number) => void;
}

/**
 * Ficha para contar cartas sin escribir: se toca una vez por cada carta que se va levantando
 * de la mesa (o de la mano). "+5" sirve para contar de a pilas de 5 y "−1" corrige un toque de más.
 */
export function FichaCartas({ valor, titulo, ejemplo, cantidad, max, tono = 'azul', deshabilitado = false, onCambiar }: Props) {
  const rojo = tono === 'rojo';
  const signo = rojo ? '−' : '+';
  const activo = cantidad > 0;
  const aplicar = (nuevo: number) => {
    const acotado = Math.max(0, Math.min(max, nuevo));
    if (acotado === cantidad) return;
    vibrar();
    onCambiar(acotado);
  };

  const marco = activo
    ? rojo
      ? 'border-rojo bg-red-50 ring-2 ring-red-200'
      : 'border-azul-vivo bg-blue-50 ring-2 ring-blue-200'
    : 'border-slate-200 bg-slate-50';
  const colorNumero = rojo ? 'text-rojo-osc' : 'text-azul';

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border-2 ${marco} ${deshabilitado ? 'opacity-40' : ''}`}>
      <button
        type="button"
        disabled={deshabilitado || cantidad >= max}
        onClick={() => aplicar(cantidad + 1)}
        aria-label={`${titulo}: ${cantidad}. Tocá para sumar una carta (máximo ${max})`}
        className="flex flex-1 flex-col items-center gap-0.5 px-2 pb-2 pt-2.5 text-center active:bg-black/5 disabled:cursor-default"
      >
        <span className="text-[13px] font-bold leading-tight text-tinta">{titulo}</span>
        <span className="text-[10px] font-semibold leading-tight text-slate-500">{ejemplo}</span>
        <span className={`mt-1 text-3xl font-bold leading-none tabular-nums ${activo ? colorNumero : 'text-slate-300'}`}>{cantidad}</span>
        <span className={`text-[11px] font-bold tabular-nums ${activo ? colorNumero : 'text-slate-400'}`}>
          {activo ? `${signo}${(cantidad * valor).toLocaleString('es-AR')} pts` : `${signo}${valor} c/u`}
        </span>
      </button>
      <div className="grid grid-cols-2 border-t border-slate-200">
        <button
          type="button"
          disabled={deshabilitado || cantidad <= 0}
          onClick={() => aplicar(cantidad - 1)}
          aria-label={`Restar una carta de ${titulo}`}
          className="h-10 border-r border-slate-200 bg-white text-sm font-bold text-slate-600 active:bg-slate-100 disabled:text-slate-300"
        >
          −1
        </button>
        <button
          type="button"
          disabled={deshabilitado || cantidad >= max}
          onClick={() => aplicar(cantidad + 5)}
          aria-label={`Sumar cinco cartas de ${titulo}`}
          className={`h-10 bg-white text-sm font-bold active:bg-slate-100 disabled:text-slate-300 ${colorNumero}`}
        >
          +5
        </button>
      </div>
    </div>
  );
}
