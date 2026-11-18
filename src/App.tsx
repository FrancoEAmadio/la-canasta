import { useEffect } from 'react';
import { TEXTO_FOOTER, VERSION_APP } from './constantes';
import { AppProvider, useApp } from './estado/AppProvider';
import { ModalAjustes } from './features/ajustes/ModalAjustes';
import { PantallaInicio } from './features/inicio/PantallaInicio';
import { PantallaJugadores } from './features/jugadores/PantallaJugadores';
import { ModalAuditoria } from './features/modales/ModalAuditoria';
import { ModalEstadisticasJugador } from './features/modales/ModalEstadisticasJugador';
import { ModalMenuPartida } from './features/modales/ModalMenuPartida';
import { ModalPodio } from './features/modales/ModalPodio';
import { PantallaNuevaPartida } from './features/partida/PantallaNuevaPartida';
import { PantallaPartida } from './features/partida/PantallaPartida';
import { PantallaReglas } from './features/wiki/PantallaReglas';
import { useWakeLock } from './ui/useWakeLock';

function ContenidoApp() {
  const { pantallaActual, ajustes, errorGuardado, descartarErrorGuardado } = useApp();

  useWakeLock(ajustes.mantenerPantallaEncendida && pantallaActual === 'partida');

  const enInicio = pantallaActual === 'inicio';
  // En el inicio la página no se desplaza: solo scrollea (dentro del contenedor fijo) si el contenido no entra en la pantalla.
  useEffect(() => {
    if (!enInicio) return;
    const { documentElement: html, body } = document;
    const anterior = [html.style.overflow, body.style.overflow];
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = anterior[0]!;
      body.style.overflow = anterior[1]!;
    };
  }, [enInicio]);

  return (
    <div className={enInicio ? 'fixed inset-0 overflow-y-auto overscroll-none' : undefined}>
    <div className={`contenedor-app mx-auto flex ${enInicio ? 'min-h-full' : 'min-h-dvh'} w-full max-w-md flex-col justify-between md:max-w-2xl`}>
      <header className="sr-only">
        <h1>La Canasta — Anotador de puntos</h1>
      </header>

      {errorGuardado && (
        <div role="alert" className="mt-2 flex items-start justify-between gap-3 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-900">
          <span>No se pudo guardar en este navegador (¿modo privado o almacenamiento lleno?). Exportá una copia desde Ajustes para no perder datos.</span>
          <button type="button" onClick={descartarErrorGuardado} aria-label="Cerrar aviso" className="text-base font-bold">
            ×
          </button>
        </div>
      )}

      {pantallaActual === 'inicio' && <PantallaInicio />}
      {pantallaActual === 'nueva_partida' && <PantallaNuevaPartida />}
      {pantallaActual === 'partida' && <PantallaPartida />}
      {pantallaActual === 'jugadores' && <PantallaJugadores />}
      {pantallaActual === 'reglas' && <PantallaReglas />}

      <footer className="pie-seguro mt-6 w-full pt-3 text-center text-xs font-medium text-blue-200/80">
        <span className="mb-1 block font-semibold text-blue-100">Versión {VERSION_APP}</span>
        <span className="block">{TEXTO_FOOTER}</span>
      </footer>

      <ModalPodio />
      <ModalAuditoria />
      <ModalEstadisticasJugador />
      <ModalMenuPartida />
      <ModalAjustes />
    </div>
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <ContenidoApp />
    </AppProvider>
  );
}
