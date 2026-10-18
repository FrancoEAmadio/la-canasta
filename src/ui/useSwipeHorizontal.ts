import { useRef } from 'react';
import type { TouchEvent, PointerEvent } from 'react';
import { RATIO_PREDOMINIO_HORIZONTAL, UMBRAL_SWIPE_PX } from '../constantes.ts';

interface OpcionesSwipe {
  onSwipeIzquierda: () => void;
  onSwipeDerecha: () => void;
}

export function useSwipeHorizontal({ onSwipeIzquierda, onSwipeDerecha }: OpcionesSwipe) {
  const inicioRef = useRef({ x: 0, y: 0 });

  const procesarDelta = (deltaX: number, deltaY: number) => {
    const esHorizontalDominante =
      Math.abs(deltaX) > UMBRAL_SWIPE_PX &&
      Math.abs(deltaX) > Math.abs(deltaY) * RATIO_PREDOMINIO_HORIZONTAL;

    if (!esHorizontalDominante) return;

    if (deltaX < 0) onSwipeIzquierda();
    else onSwipeDerecha();
  };

  const iniciarTouch = (evento: TouchEvent) => {
    const touch = evento.touches[0];
    if (!touch) return;
    inicioRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const finalizarTouch = (evento: TouchEvent) => {
    const touch = evento.changedTouches[0];
    if (!touch) return;
    procesarDelta(touch.clientX - inicioRef.current.x, touch.clientY - inicioRef.current.y);
  };

  const iniciarPointer = (evento: PointerEvent) => {
    inicioRef.current = { x: evento.clientX, y: evento.clientY };
    if (evento.currentTarget instanceof Element) {
      evento.currentTarget.setPointerCapture(evento.pointerId);
    }
  };

  const finalizarPointer = (evento: PointerEvent) => {
    procesarDelta(evento.clientX - inicioRef.current.x, evento.clientY - inicioRef.current.y);
  };

  return { iniciarTouch, finalizarTouch, iniciarPointer, finalizarPointer };
}
