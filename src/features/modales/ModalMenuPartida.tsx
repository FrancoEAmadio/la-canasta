import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { compartirTexto, textoResultado } from '../../infra/compartir';
import { ModalAviso } from '../../ui/ModalAviso';
import { ModalConfirmacion } from '../../ui/ModalConfirmacion';

export function ModalMenuPartida() {
  const { menuPartidaAbierto, setMenuPartidaAbierto, setPantallaActual, setRondasAbiertas, setAjustesAbiertos, abrirPodio, partida: estado } = useApp();
  const [accion, setAccion] = useState<'terminar' | 'descartar' | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const partida = estado.partidaActiva;

  if (!partida) return null;
  const cerrarMenu = () => setMenuPartidaAbierto(false);

  const terminar = () => {
    setAccion(null);
    if (!estado.finalizarPartida(false)) {
      setAviso('Cerrá al menos una ronda antes de terminar la partida. Si querés salir sin guardar, usá «Descartar partida».');
      return;
    }
    abrirPodio(partida.id);
  };

  const compartirTabla = async () => {
    cerrarMenu();
    const resultado = await compartirTexto('La Canasta', textoResultado(partida));
    if (resultado === 'copiado') setAviso('Tabla copiada al portapapeles.');
    if (resultado === 'error') setAviso('No se pudo compartir en este dispositivo.');
  };

  return (
    <>
      {menuPartidaAbierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-start bg-black/70 p-4 backdrop-blur-sm" onClick={cerrarMenu}>
          <nav className="tarjeta entrar mt-12 flex w-72 flex-col gap-2 p-4" onClick={(evento) => evento.stopPropagation()} aria-label="Menú de partida">
            <div className="mb-1 flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-display text-base font-black text-azul">Menú de partida</span>
              <button type="button" onClick={cerrarMenu} aria-label="Cerrar menú" className="h-8 w-8 rounded-lg text-lg font-bold text-slate-400 hover:bg-slate-100">
                ×
              </button>
            </div>
            <button type="button" onClick={() => { cerrarMenu(); setPantallaActual('inicio'); }} className="btn-claro justify-start px-3 py-2.5 text-sm">
              🏠 Volver al inicio (se guarda)
            </button>
            <button type="button" onClick={() => { cerrarMenu(); setRondasAbiertas(true); }} className="btn-claro justify-start px-3 py-2.5 text-sm">
              📋 Rondas y correcciones
            </button>
            <button type="button" onClick={() => void compartirTabla()} className="btn-claro justify-start px-3 py-2.5 text-sm">
              📤 Compartir tabla
            </button>
            <button type="button" onClick={() => { cerrarMenu(); setAjustesAbiertos(true); }} className="btn-claro justify-start px-3 py-2.5 text-sm">
              ⚙️ Ajustes
            </button>
            <button type="button" onClick={() => { cerrarMenu(); setAccion('terminar'); }} className="btn-primario justify-start px-3 py-2.5 text-sm">
              🏁 Terminar partida ahora
            </button>
            <button type="button" onClick={() => { cerrarMenu(); setAccion('descartar'); }} className="btn-secundario justify-start px-3 py-2.5 text-sm">
              🗑️ Descartar partida
            </button>
          </nav>
        </div>
      )}

      <ModalConfirmacion
        abierto={accion === 'terminar'}
        titulo="Terminar partida"
        descripcion="¿Terminar la partida con las rondas cerradas hasta ahora?"
        advertencia="Se guarda el resultado y se suma a las estadísticas. Lo que estés cargando en la ronda actual (sin confirmar) no se cuenta."
        textoConfirmar="Terminar"
        tono="normal"
        onCancelar={() => setAccion(null)}
        onConfirmar={terminar}
      />
      <ModalConfirmacion
        abierto={accion === 'descartar'}
        titulo="Descartar partida"
        descripcion="¿Descartar esta partida?"
        advertencia="Se pierde todo lo cargado y no queda en el historial ni en las estadísticas."
        textoConfirmar="Descartar"
        onCancelar={() => setAccion(null)}
        onConfirmar={() => {
          estado.eliminarPartida(partida.id);
          setAccion(null);
          setPantallaActual('inicio');
        }}
      />
      <ModalAviso abierto={aviso !== null} titulo="Aviso" mensaje={aviso} onCerrar={() => setAviso(null)} textoBoton="OK" />
    </>
  );
}
