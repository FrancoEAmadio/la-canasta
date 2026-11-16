import { registerSW } from 'virtual:pwa-register';

let registro: ServiceWorkerRegistration | undefined;

/** Registra el service worker y busca versiones nuevas al abrir, al volver a la app y cada hora. */
export function iniciarServiceWorker(): void {
  registerSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      registro = reg;
    },
  });
  const buscar = () => void registro?.update().catch(() => undefined);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') buscar();
  });
  setInterval(buscar, 60 * 60 * 1000);
}

export type ResultadoBusqueda = 'nueva' | 'actual' | 'error';

/** Pregunta al servidor si hay una versión nueva. Si la hay, la app se recarga sola al terminar de bajarla. */
export async function buscarActualizacion(): Promise<ResultadoBusqueda> {
  if (!registro) return 'error';
  try {
    await registro.update();
    return registro.installing || registro.waiting ? 'nueva' : 'actual';
  } catch {
    return 'error';
  }
}

/** Borra el service worker y los archivos guardados (NO toca partidas ni jugadores) y recarga con todo nuevo. */
export async function limpiarYRecargar(): Promise<void> {
  try {
    const registros = await navigator.serviceWorker?.getRegistrations();
    await Promise.all((registros ?? []).map((r) => r.unregister()));
    const claves = await caches.keys();
    await Promise.all(claves.map((c) => caches.delete(c)));
  } finally {
    window.location.reload();
  }
}
