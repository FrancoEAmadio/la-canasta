interface Props {
  valor: number | null;
  onCambiar: (nuevo: number | null) => void;
  etiqueta: string;
  placeholder?: string;
  /** Ancho fijo en px; sin esto el campo ocupa todo el ancho disponible. */
  ancho?: number;
  /** Alto fijo en px (si se omite, el alto estándar del campo). */
  alto?: number;
}

/**
 * Campo numérico: teclado numérico puro, solo dígitos, sin seleccionar el texto al enfocar
 * (queda el cursor para escribir). Vacío = null.
 */
export function CampoNumero({ valor, onCambiar, etiqueta, placeholder, ancho, alto }: Props) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      enterKeyHint="done"
      autoComplete="off"
      value={valor === null ? '' : String(valor)}
      placeholder={placeholder}
      aria-label={etiqueta}
      onChange={(evento) => {
        const digitos = evento.target.value.replace(/\D/g, '').slice(0, 9);
        onCambiar(digitos === '' ? null : Number(digitos));
      }}
      style={ancho || alto ? { width: ancho, height: alto, minHeight: alto, flexShrink: 0 } : undefined}
      className="campo campo-numero"
    />
  );
}
