import { useEffect } from 'react';

let abiertos = 0;

/** Bloquea el scroll de la página de fondo mientras haya algún modal abierto (cuenta referencias, por si hay modales apilados). */
export function useBloqueoScroll(activo: boolean) {
  useEffect(() => {
    if (!activo) return;
    abiertos += 1;
    document.documentElement.classList.add('bloqueo-scroll');
    return () => {
      abiertos -= 1;
      if (abiertos <= 0) {
        abiertos = 0;
        document.documentElement.classList.remove('bloqueo-scroll');
      }
    };
  }, [activo]);
}
