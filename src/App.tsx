import { TEXTO_FOOTER } from './constantes';
import { AppProvider, useApp } from './estado/AppProvider';
import { ModalAjustes } from './features/ajustes/ModalAjustes';
import { PantallaInicio } from './features/inicio/PantallaInicio';
import { PantallaJugadores } from './features/jugadores/PantallaJugadores';
import { ModalAuditoria } from './features/modales/ModalAuditoria';
import { ModalEstadisticasJugador } from './features/modales/ModalEstadisticasJugador';
import { ModalMenuPartida } from './features/modales/ModalMenuPartida';
import { ModalPodio } from './features/modales/ModalPodio';
import { ModalRondas } from './features/modales/ModalRondas';
import { PantallaNuevaPartida } from './features/partida/PantallaNuevaPartida';
import { PantallaPartida } from './features/partida/PantallaPartida';
import { PantallaReglas } from './features/wiki/PantallaReglas';
import { useWakeLock } from './ui/useWakeLock';

function ContenidoApp() {
  const { pantallaActual, ajustes, errorGuardado, descartarErrorGuardado } = useApp();

  useWakeLock(ajustes.mantenerPantallaEncendida && pantallaActual === 'partida');

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="sr-only">
        <h1>La Canasta — Anotador de puntos</h1>
      </header>

      {errorGuardado && (
        <div role="alert" className="mt-2 flex items-start justify-between gap-3 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-900">
          <span>No se pudo guardar en este navegador (¿modo privado o almacenamiento lleno?). Exportá una copia desde Ajustes para no perder datos.</span>
          <button type="button" onClick={descartarErrorGuardado} aria-label="Cerrar aviso" className="text-base font-black">
            ×
          </button>
        </div>
      )}

      {pantallaActual === 'inicio' && <PantallaInicio />}
      {pantallaActual === 'nueva_partida' && <PantallaNuevaPartida />}
      {pantallaActual === 'partida' && <PantallaPartida />}
      {pantallaActual === 'jugadores' && <PantallaJugadores />}
      {pantallaActual === 'reglas' && <PantallaReglas />}

      <footer className="pie-seguro mt-6 w-full border-t border-white/15 py-3 text-center">
        <p className="text-[11px] font-semibold text-blue-200/80">{TEXTO_FOOTER}</p>
      </footer>

      <ModalPodio />
      <ModalAuditoria />
      <ModalEstadisticasJugador />
      <ModalMenuPartida />
      <ModalRondas />
      <ModalAjustes />
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
