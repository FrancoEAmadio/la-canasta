interface Props {
  valor: number;
  onCambiar: (nuevo: number) => void;
  max: number;
  etiqueta: string;
  tono?: 'azul' | 'rojo';
  deshabilitado?: boolean;
}

/**
 * Cantidad de cartas escrita a mano (reemplaza al contador − / +). Empieza vacío con "0" de marcador,
 * abre el teclado numérico, no selecciona el texto al enfocar y corrige al máximo posible si se pasa.
 */
export function CampoCantidad({ valor, onCambiar, max, etiqueta, tono = 'azul', deshabilitado = false }: Props) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="next"
        autoComplete="off"
        value={valor === 0 ? '' : String(valor)}
        placeholder="0"
        disabled={deshabilitado}
        aria-label={`${etiqueta} (máximo ${max})`}
        onChange={(evento) => {
          const digitos = evento.target.value.replace(/\D/g, '').slice(0, 4);
          const numero = digitos === '' ? 0 : Math.min(max, Number(digitos));
          if (numero !== valor) onCambiar(numero);
        }}
        className={`campo campo-cantidad scroll-my-28 ${tono === 'rojo' ? 'campo-cantidad-rojo' : ''}`}
      />
      <span className="text-[10px] font-semibold text-slate-400">Máx. {max}</span>
    </div>
  );
}
