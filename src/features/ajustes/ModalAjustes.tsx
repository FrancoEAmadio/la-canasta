import { useRef, useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { borrarTodosLosDatos, crearCopiaSeguridad, interpretarCopiaSeguridad } from '../../infra/almacenamiento';
import { descargarArchivo } from '../../infra/compartir';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import { ModalAviso } from '../../ui/ModalAviso';
import { ModalConfirmacion } from '../../ui/ModalConfirmacion';
import { Toggle } from '../../ui/Toggle';

export function ModalAjustes() {
  const { ajustesAbiertos, setAjustesAbiertos, ajustes, cambiarAjustes, jugadores, reemplazarJugadores, partida, setPantallaActual } = useApp();
  const archivoRef = useRef<HTMLInputElement>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  const exportar = () => {
    const copia = crearCopiaSeguridad(jugadores, partida.partidas, ajustes);
    const fecha = new Date().toISOString().slice(0, 10);
    descargarArchivo(`la-canasta-copia-${fecha}.json`, JSON.stringify(copia, null, 2));
  };

  const importar = async (archivo: File | undefined) => {
    if (!archivo) return;
    const copia = interpretarCopiaSeguridad(await archivo.text());
    if (archivoRef.current) archivoRef.current.value = '';
    if (!copia) {
      setAviso('Ese archivo no es una copia de seguridad válida de La Canasta.');
      return;
    }
    // Se combinan por id: lo importado pisa lo existente con el mismo id y el resto se conserva.
    const jugadoresPorId = new Map(jugadores.map((jugador) => [jugador.id, jugador]));
    for (const jugador of copia.jugadores) jugadoresPorId.set(jugador.id, jugador);
    const partidasPorId = new Map(partida.partidas.map((item) => [item.id, item]));
    for (const item of copia.partidas) partidasPorId.set(item.id, item);

    reemplazarJugadores([...jugadoresPorId.values()]);
    partida.reemplazarTodas([...partidasPorId.values()]);
    cambiarAjustes(copia.ajustes);
    setAviso(`Copia importada: ${copia.jugadores.length} jugadores y ${copia.partidas.length} partidas.`);
  };

  const borrarTodo = () => {
    borrarTodosLosDatos();
    window.location.reload();
  };

  return (
    <>
      <Modal abierto={ajustesAbiertos} onCerrar={() => setAjustesAbiertos(false)} ancho="max-w-md" zIndex="z-[60]" etiqueta="Ajustes" cerrarAlHacerClickAfuera>
        <EncabezadoModal titulo="⚙️ Ajustes" subtitulo="Preferencias y copia de seguridad" onCerrar={() => setAjustesAbiertos(false)} />
        <div className="scroll-oculto flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="block text-sm font-black text-tinta">Mantener la pantalla encendida</span>
                <span className="block text-xs text-slate-500">Durante la partida, para no desbloquear el celu en cada ronda.</span>
              </div>
              <Toggle etiqueta="Mantener la pantalla encendida" checked={ajustes.mantenerPantallaEncendida} onChange={(valor) => cambiarAjustes({ mantenerPantallaEncendida: valor })} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="block text-sm font-black text-tinta">Vibración al tocar contadores</span>
                <span className="block text-xs text-slate-500">Solo en dispositivos compatibles.</span>
              </div>
              <Toggle etiqueta="Vibración" checked={ajustes.vibracion} onChange={(valor) => cambiarAjustes({ vibracion: valor })} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-3">
            <h4 className="text-sm font-black text-azul">💾 Copia de seguridad</h4>
            <p className="mb-3 mt-1 text-xs leading-relaxed text-slate-500">
              Tus datos viven en este dispositivo (sin servidor ni cuenta). Exportá un archivo para guardarlos o pasarlos a otro celular.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={exportar} className="btn-primario py-2.5 text-sm">
                ⬇ Exportar
              </button>
              <button type="button" onClick={() => archivoRef.current?.click()} className="btn-claro py-2.5 text-sm">
                ⬆ Importar
              </button>
            </div>
            <input ref={archivoRef} type="file" accept="application/json,.json" className="hidden" onChange={(evento) => void importar(evento.target.files?.[0])} />
          </section>

          <button type="button" onClick={() => setConfirmarBorrado(true)} className="btn-secundario py-3 text-sm">
            🗑️ Borrar todos los datos
          </button>
        </div>
      </Modal>

      <ModalConfirmacion
        abierto={confirmarBorrado}
        titulo="Borrar todos los datos"
        descripcion="¿Borrar jugadores, estadísticas, historial y partidas en curso?"
        advertencia="No se puede deshacer. Si querés conservarlos, exportá una copia antes."
        textoConfirmar="Borrar todo"
        zIndex="z-[80]"
        onCancelar={() => setConfirmarBorrado(false)}
        onConfirmar={() => {
          setConfirmarBorrado(false);
          setPantallaActual('inicio');
          borrarTodo();
        }}
      />
      <ModalAviso abierto={aviso !== null} titulo="Copia de seguridad" mensaje={aviso} onCerrar={() => setAviso(null)} textoBoton="OK" zIndex="z-[80]" />
    </>
  );
}
