import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { calcularPorcentajeVictorias } from '../../dominio/estadisticas';
import {
  calcularRanking,
  formatearFecha,
  ordenarPartidas,
  subtituloParticipante,
} from '../../dominio/partida';
import { formatearPuntos } from '../../dominio/puntuacion';
import { compartirTexto, textoResultado } from '../../infra/compartir';
import { AvatarJugador } from '../../ui/AvatarJugador';
import { ModalAviso } from '../../ui/ModalAviso';
import { ModalConfirmacion } from '../../ui/ModalConfirmacion';
import { SelectorPalo } from '../../ui/SelectorPalo';
import type { JugadorPermanente, Palo, Partida } from '../../tipos';

type Vista = 'gestor' | 'estadisticas' | 'historial';

const PESTANAS: [Vista, string][] = [
  ['gestor', '👤 Jugadores'],
  ['estadisticas', '📊 Estadísticas'],
  ['historial', '📜 Historial'],
];

export function PantallaJugadores() {
  const { setPantallaActual } = useApp();
  const [vista, setVista] = useState<Vista>('gestor');

  return (
    <main className="entrar flex w-full flex-col gap-4 py-5">
      <button type="button" onClick={() => setPantallaActual('inicio')} className="btn-fantasma self-start px-3 py-2 text-sm">
        ← Volver al menú
      </button>
      <h2 className="font-display text-2xl font-black text-white">Jugadores, Estadísticas e Historial</h2>

      <div className="grid grid-cols-3 gap-2" role="tablist">
        {PESTANAS.map(([id, etiqueta]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={vista === id}
            onClick={() => setVista(id)}
            className={`${vista === id ? 'btn-primario border-white/40' : 'btn-fantasma'} px-1 py-2.5 text-[12px]`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {vista === 'gestor' && <VistaGestor />}
      {vista === 'estadisticas' && <VistaEstadisticas />}
      {vista === 'historial' && <VistaHistorial />}
    </main>
  );
}

// ───────────────────────── Gestor de tarjetas ─────────────────────────
function VistaGestor() {
  const { jugadores, crearJugador, editarJugador, eliminarJugador, verEstadisticasJugador } = useApp();
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [paloNuevo, setPaloNuevo] = useState<Palo>('picas');
  const [edicion, setEdicion] = useState<{ id: string; nombre: string; palo: Palo } | null>(null);
  const [pendienteEliminar, setPendienteEliminar] = useState<JugadorPermanente | null>(null);
  const [error, setError] = useState<string | null>(null);

  const crear = () => {
    const resultado = crearJugador(nombreNuevo, paloNuevo);
    if (!resultado.ok) {
      setError(resultado.motivo === 'duplicado' ? 'Ya existe un jugador con ese nombre.' : 'Escribí un nombre.');
      return;
    }
    setError(null);
    setNombreNuevo('');
  };

  const guardarEdicion = () => {
    if (!edicion) return;
    const resultado = editarJugador(edicion.id, edicion.nombre, edicion.palo);
    if (resultado === 'ok') {
      setEdicion(null);
      setError(null);
    } else {
      setError(resultado === 'duplicado' ? 'Ya existe un jugador con ese nombre.' : 'Escribí un nombre.');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <form
        className="tarjeta flex flex-col gap-2.5 p-4"
        onSubmit={(evento) => {
          evento.preventDefault();
          crear();
        }}
      >
        <span className="text-[11px] font-black uppercase tracking-wider text-azul">Nueva tarjeta de jugador</span>
        <div className="flex gap-2">
          <input
            value={nombreNuevo}
            onChange={(evento) => setNombreNuevo(evento.target.value)}
            type="text"
            maxLength={24}
            placeholder="Nombre del jugador..."
            aria-label="Nombre del jugador"
            className="campo min-w-0 flex-1"
          />
          <button type="submit" className="btn-primario px-4 text-sm">
            + Crear
          </button>
        </div>
        <SelectorPalo valor={paloNuevo} onCambiar={setPaloNuevo} />
        {error && !edicion && <span className="text-xs font-bold text-rojo-osc">{error}</span>}
      </form>

      {jugadores.length === 0 ? (
        <div className="tarjeta p-8 text-center text-sm text-slate-600">Todavía no hay tarjetas de jugadores. ¡Creá la primera arriba!</div>
      ) : (
        jugadores.map((jugador) => (
          <div key={jugador.id} className="tarjeta flex flex-col gap-2 p-3.5">
            {edicion?.id === jugador.id ? (
              <>
                <div className="flex gap-2">
                  <input
                    value={edicion.nombre}
                    onChange={(evento) => setEdicion({ ...edicion, nombre: evento.target.value })}
                    onKeyDown={(evento) => evento.key === 'Enter' && guardarEdicion()}
                    type="text"
                    maxLength={24}
                    aria-label="Nuevo nombre"
                    className="campo min-w-0 flex-1"
                  />
                  <button type="button" onClick={guardarEdicion} className="btn-primario px-3 text-sm" aria-label="Guardar">
                    ✓
                  </button>
                  <button type="button" onClick={() => { setEdicion(null); setError(null); }} className="btn-claro px-3 text-sm" aria-label="Cancelar edición">
                    ✕
                  </button>
                </div>
                <SelectorPalo valor={edicion.palo} onCambiar={(palo) => setEdicion({ ...edicion, palo })} />
                {error && <span className="text-xs font-bold text-rojo-osc">{error}</span>}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => verEstadisticasJugador(jugador)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <AvatarJugador palo={jugador.palo} />
                  <span className="min-w-0">
                    <span className="block truncate text-base font-black text-tinta">{jugador.nombre}</span>
                    <span className="block text-[11px] font-semibold text-slate-500">
                      {jugador.estadisticas.partidasJugadas} partida{jugador.estadisticas.partidasJugadas === 1 ? '' : 's'} · 🏆 {jugador.estadisticas.victorias} · {calcularPorcentajeVictorias(jugador)}%
                    </span>
                  </span>
                </button>
                <button type="button" onClick={() => { setEdicion({ id: jugador.id, nombre: jugador.nombre, palo: jugador.palo }); setError(null); }} aria-label={`Editar a ${jugador.nombre}`} className="btn-claro h-10 w-10 text-sm">
                  ✏️
                </button>
                <button type="button" onClick={() => setPendienteEliminar(jugador)} aria-label={`Eliminar a ${jugador.nombre}`} className="btn-claro h-10 w-10 text-sm">
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))
      )}

      <ModalConfirmacion
        abierto={pendienteEliminar !== null}
        titulo="Eliminar jugador"
        descripcion={`¿Eliminar la tarjeta de ${pendienteEliminar?.nombre ?? ''}?`}
        advertencia="Se pierden sus estadísticas. Las partidas guardadas en el historial conservan su nombre."
        textoConfirmar="Eliminar"
        onCancelar={() => setPendienteEliminar(null)}
        onConfirmar={() => {
          if (pendienteEliminar) eliminarJugador(pendienteEliminar.id);
          setPendienteEliminar(null);
        }}
      />
    </div>
  );
}

// ───────────────────────── Estadísticas ─────────────────────────
function VistaEstadisticas() {
  const { jugadores, verEstadisticasJugador } = useApp();

  if (jugadores.length === 0) {
    return <div className="tarjeta p-8 text-center text-sm text-slate-600">Creá tarjetas de jugadores para ver sus estadísticas.</div>;
  }

  const ordenados = [...jugadores].sort(
    (a, b) =>
      b.estadisticas.victorias - a.estadisticas.victorias ||
      calcularPorcentajeVictorias(b) - calcularPorcentajeVictorias(a) ||
      b.estadisticas.partidasJugadas - a.estadisticas.partidasJugadas
  );

  return (
    <div className="flex flex-col gap-3">
      {ordenados.map((jugador, indice) => (
        <button key={jugador.id} type="button" onClick={() => verEstadisticasJugador(jugador)} className="tarjeta flex items-center gap-3 p-3.5 text-left">
          <span className="w-6 text-center font-display text-lg font-black text-slate-400">{indice + 1}</span>
          <AvatarJugador palo={jugador.palo} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-black text-tinta">{jugador.nombre}</span>
            <span className="block text-[11px] font-semibold text-slate-500">
              {jugador.estadisticas.partidasJugadas} jugadas · 🏆 {jugador.estadisticas.victorias} · récord{' '}
              {jugador.estadisticas.mejorPartida === null ? '—' : formatearPuntos(jugador.estadisticas.mejorPartida)}
            </span>
          </span>
          <span className="text-right">
            <span className="block text-xl font-black text-azul">{calcularPorcentajeVictorias(jugador)}%</span>
            <span className="block text-[9px] font-bold uppercase text-slate-400">victorias</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ───────────────────────── Historial ─────────────────────────
function VistaHistorial() {
  const { partida, abrirPodio, verAuditoria } = useApp();
  const [aEliminar, setAEliminar] = useState<Partida | null>(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [avisoCompartir, setAvisoCompartir] = useState<string | null>(null);

  const lista = ordenarPartidas(partida.partidas);
  const hayFinalizadas = lista.some((item) => item.estado === 'finalizada');

  const compartir = async (item: Partida) => {
    const resultado = await compartirTexto('La Canasta', textoResultado(item));
    if (resultado === 'copiado') setAvisoCompartir('Resultado copiado al portapapeles.');
    if (resultado === 'error') setAvisoCompartir('No se pudo compartir en este dispositivo.');
  };

  return (
    <div className="flex flex-col gap-4">
      {hayFinalizadas && (
        <div className="flex justify-end">
          <button type="button" onClick={() => setConfirmarBorrado(true)} className="btn-secundario px-3 py-2 text-xs">
            Borrar historial
          </button>
        </div>
      )}

      {lista.length === 0 ? (
        <div className="tarjeta p-8 text-center text-sm text-slate-600">No hay partidas registradas.</div>
      ) : (
        lista.map((item) => {
          const ranking = calcularRanking(item);
          const enCurso = item.estado === 'en_curso';
          return (
            <article key={item.id} className="tarjeta flex flex-col gap-3 p-4">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${enCurso ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-azul'}`}>
                    {enCurso ? '⏳ En curso' : '🏁 Finalizada'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-600">
                    {item.modo === 'parejas' ? '🤝 Parejas' : '🙋 Individual'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-500">{formatearFecha(item.finalizadaEn ?? item.actualizada)}</span>
              </header>

              <p className="text-xs text-slate-500">
                {item.rondas.length} ronda{item.rondas.length === 1 ? '' : 's'} ·{' '}
                {item.objetivo === null ? 'sin límite de puntos' : `meta ${item.objetivo.toLocaleString('es-AR')} pts`}
              </p>

              <div className="flex flex-col gap-1.5">
                {ranking.map((fila) => (
                  <button
                    key={fila.participante.id}
                    type="button"
                    onClick={() => verAuditoria(item, fila.participante.id)}
                    className={`fila-puntaje rounded-xl px-3 py-2 text-left text-sm font-bold ${
                      fila.posicion === 1 && !enCurso ? 'bg-azul text-white' : 'bg-slate-100 text-tinta'
                    }`}
                  >
                    <span className="fila-puntaje-izq">
                      <span className="min-w-0 flex-1">
                        <span className="fila-puntaje-nombre">
                          {['🥇', '🥈', '🥉'][fila.posicion - 1] ?? `${fila.posicion}.`} {fila.participante.nombre}
                        </span>
                        {subtituloParticipante(fila.participante) && (
                          <span className="fila-puntaje-nombre text-[11px] font-semibold opacity-75">{subtituloParticipante(fila.participante)}</span>
                        )}
                        <span className="block text-[10px] font-semibold opacity-70">🔍 Ver desglose por ronda</span>
                      </span>
                    </span>
                    <span className="fila-puntaje-valor text-base font-black">{formatearPuntos(fila.puntos)} pts</span>
                  </button>
                ))}
              </div>

              <footer className="grid grid-cols-2 gap-2">
                {enCurso ? (
                  <>
                    <button type="button" onClick={() => partida.reanudarPartida(item.id)} className="btn-primario py-2.5 text-sm">
                      ▶ Reanudar
                    </button>
                    <button type="button" onClick={() => setAEliminar(item)} className="btn-claro py-2.5 text-sm">
                      🗑️ Descartar
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => abrirPodio(item.id)} className="btn-primario py-2.5 text-sm">
                      🏆 Ver podio
                    </button>
                    <button type="button" onClick={() => void compartir(item)} className="btn-claro py-2.5 text-sm">
                      📤 Compartir
                    </button>
                    <button type="button" onClick={() => setAEliminar(item)} className="btn-claro col-span-2 py-2 text-xs text-rojo-osc">
                      ✕ Eliminar del historial
                    </button>
                  </>
                )}
              </footer>
            </article>
          );
        })
      )}

      <ModalConfirmacion
        abierto={aEliminar !== null}
        titulo={aEliminar?.estado === 'en_curso' ? 'Descartar partida' : 'Eliminar partida'}
        descripcion={aEliminar?.estado === 'en_curso' ? '¿Descartar esta partida en curso?' : '¿Eliminar esta partida del historial?'}
        advertencia={
          aEliminar?.estado === 'en_curso'
            ? 'Se pierde todo lo cargado hasta ahora.'
            : 'Las estadísticas de los jugadores no se modifican.'
        }
        textoConfirmar={aEliminar?.estado === 'en_curso' ? 'Descartar' : 'Eliminar'}
        onCancelar={() => setAEliminar(null)}
        onConfirmar={() => {
          if (aEliminar) partida.eliminarPartida(aEliminar.id);
          setAEliminar(null);
        }}
      />
      <ModalConfirmacion
        abierto={confirmarBorrado}
        titulo="Borrar historial"
        descripcion="¿Borrar todas las partidas finalizadas?"
        advertencia="Las partidas en curso se conservan. Las estadísticas de los jugadores no se modifican."
        textoConfirmar="Borrar todo"
        onCancelar={() => setConfirmarBorrado(false)}
        onConfirmar={() => {
          partida.borrarFinalizadas();
          setConfirmarBorrado(false);
        }}
      />
      <ModalAviso abierto={avisoCompartir !== null} titulo="Compartir" mensaje={avisoCompartir} onCerrar={() => setAvisoCompartir(null)} textoBoton="OK" />
    </div>
  );
}
