interface Props {
  valor: number | null;
  onCambiar: (nuevo: number | null) => void;
  etiqueta: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  /** Ancho fijo en px; sin esto el campo ocupa todo el ancho disponible. */
  ancho?: number;
  /** Alto fijo en px (si se omite, el alto estándar del campo). */
  alto?: number;
  grande?: boolean;
}

/** Campo numérico que acepta quedar vacío mientras se escribe (vacío = null). */
export function CampoNumero({ valor, onCambiar, etiqueta, min = 0, max, step = 1, placeholder, ancho, alto, grande = false }: Props) {
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
      style={ancho || alto ? { width: ancho, height: alto, minHeight: alto, flexShrink: 0 } : undefined}
      className={`campo campo-numero ${grande ? 'campo-grande' : ''}`}
    />
  );
}
