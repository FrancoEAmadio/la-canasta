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

/** Doble toque corto: se siente distinto al de sumar, para notar sin mirar que algo se borró o volvió a 0. */
export function vibrarBorrado(): void {
  if (!activa) return;
  try {
    navigator.vibrate?.([20, 40, 20]);
  } catch {
    /* ignorado */
  }
}
