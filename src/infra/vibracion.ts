let activa = true;

export function configurarVibracion(habilitada: boolean): void {
  activa = habilitada;
}

/** Vibración corta de feedback táctil (solo en dispositivos que la soportan). */
export function vibrar(milisegundos = 8): void {
  if (!activa) return;
  try {
    navigator.vibrate?.(milisegundos);
  } catch {
    /* ignorado */
  }
}
