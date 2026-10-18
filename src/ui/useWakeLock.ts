import { useEffect } from 'react';

/** Mantiene la pantalla encendida mientras `activo` sea true (útil con el celu apoyado en la mesa). */
export function useWakeLock(activo: boolean): void {
  useEffect(() => {
    if (!activo || !('wakeLock' in navigator)) return;

    let candado: WakeLockSentinel | null = null;
    let cancelado = false;

    const pedir = async () => {
      try {
        const nuevo = await navigator.wakeLock.request('screen');
        if (cancelado) {
          void nuevo.release();
          return;
        }
        candado = nuevo;
      } catch {
        /* el navegador puede negarlo (ahorro de batería, pestaña oculta) */
      }
    };

    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') void pedir();
    };

    void pedir();
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      cancelado = true;
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      void candado?.release();
    };
  }, [activo]);
}
