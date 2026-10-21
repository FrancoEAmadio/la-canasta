interface Props {
  valor: number | null;
  onCambiar: (nuevo: number | null) => void;
  etiqueta: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
}

/** Campo numérico que acepta quedar vacío mientras se escribe (vacío = null). */
export function CampoNumero({ valor, onCambiar, etiqueta, min = 0, max, step = 1, placeholder, className = '' }: Props) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      step={step}
      value={valor ?? ''}
      placeholder={placeholder}
      aria-label={etiqueta}
      onFocus={(evento) => evento.currentTarget.select()}
      onChange={(evento) => {
        const texto = evento.target.value;
        if (texto === '') return onCambiar(null);
        const numero = Number(texto);
        onCambiar(Number.isFinite(numero) ? Math.trunc(numero) : null);
      }}
      className={`campo text-center font-black tabular-nums ${className}`}
    />
  );
}
