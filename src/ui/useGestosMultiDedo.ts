import { useRef } from 'react';
import type { TouchEvent } from 'react';

interface Opciones {
  /** Deslizar con dos dedos: +1 = siguiente (hacia la izquierda), −1 = anterior (hacia la derecha). */
  dos?: (direccion: 1 | -1) => void;
  /** Deslizar con tres dedos. */
  tres?: (direccion: 1 | -1) => void;
}

const UMBRAL = 60;

function promedio(touches: TouchEvent['touches']) {
  let x = 0;
  let y = 0;
  for (let i = 0; i < touches.length; i++) {
    x += touches[i]!.clientX;
    y += touches[i]!.clientY;
  }
  return { x: x / touches.length, y: y / touches.length };
}

/** Un dedo nunca desliza (se usa para anotar y hacer scroll): solo dos o tres dedos juntos. */
export function useGestosMultiDedo({ dos, tres }: Opciones) {
  const ref = useRef({ max: 0, inicio: null as null | { x: number; y: number }, fin: { x: 0, y: 0 } });

  const alTocar = (e: TouchEvent) => {
    const g = ref.current;
    g.max = Math.max(g.max, e.touches.length);
    if (e.touches.length >= 2) {
      const p = promedio(e.touches);
      if (!g.inicio) g.inicio = p;
      g.fin = p;
    }
  };
  const alMover = (e: TouchEvent) => {
    if (e.touches.length >= 2) ref.current.fin = promedio(e.touches);
  };
  const alSoltar = (e: TouchEvent) => {
    if (e.touches.length > 0) return;
    const g = ref.current;
    if (g.inicio && g.max >= 2) {
      const dx = g.fin.x - g.inicio.x;
      const dy = g.fin.y - g.inicio.y;
      if (Math.abs(dx) > UMBRAL && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const dir: 1 | -1 = dx < 0 ? 1 : -1;
        if (g.max >= 3) tres?.(dir);
        else dos?.(dir);
      }
    }
    g.max = 0;
    g.inicio = null;
  };
  return { onTouchStart: alTocar, onTouchMove: alMover, onTouchEnd: alSoltar, onTouchCancel: alSoltar };
}
