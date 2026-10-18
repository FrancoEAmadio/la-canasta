interface Props {
  checked: boolean;
  onChange: (nuevo: boolean) => void;
  disabled?: boolean;
  etiqueta: string;
}

/** Interruptor accesible (rol "switch"). */
export function Toggle({ checked, onChange, disabled, etiqueta }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={etiqueta}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full border-2 transition-colors disabled:opacity-40 ${
        checked ? 'border-azul bg-azul-vivo' : 'border-slate-300 bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-[1.65rem]' : 'left-0.5'}`}
      />
    </button>
  );
}
