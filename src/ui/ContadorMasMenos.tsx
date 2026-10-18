import { vibrar } from '../infra/vibracion';

interface Props {
  valor: number;
  onCambiar: (nuevo: number) => void;
  min?: number;
  max?: number;
  tono?: 'azul' | 'rojo';
  etiqueta: string;
  deshabilitado?: boolean;
}

/** Contador [-] cantidad [+]. El número del medio también se puede tocar y escribir. */
export function ContadorMasMenos({ valor, onCambiar, min = 0, max = 99, tono = 'azul', etiqueta, deshabilitado = false }: Props) {
  const aplicar = (nuevo: number) => {
    const acotado = Math.max(min, Math.min(max, Math.trunc(nuevo)));
    if (acotado !== valor) {
      vibrar();
      onCambiar(acotado);
    }
  };

  const colorMas = tono === 'rojo' ? 'btn-secundario' : 'btn-primario';
  const colorValor = tono === 'rojo' ? 'text-rojo-osc' : 'text-azul';

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => aplicar(valor - 1)}
        disabled={deshabilitado || valor <= min}
        aria-label={`Restar ${etiqueta}`}
        className="btn-claro h-11 w-11 text-xl"
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={valor}
        disabled={deshabilitado}
        aria-label={etiqueta}
        onFocus={(evento) => evento.currentTarget.select()}
        onChange={(evento) => {
          const numero = parseInt(evento.target.value.replace(/\D/g, ''), 10);
          aplicar(Number.isNaN(numero) ? 0 : numero);
        }}
        className={`h-11 w-12 rounded-lg border-0 bg-transparent text-center text-2xl font-black ${colorValor} focus:bg-slate-100 disabled:opacity-40`}
      />
      <button
        type="button"
        onClick={() => aplicar(valor + 1)}
        disabled={deshabilitado || valor >= max}
        aria-label={`Sumar ${etiqueta}`}
        className={`${colorMas} h-11 w-11 text-xl`}
      >
        +
      </button>
    </div>
  );
}
