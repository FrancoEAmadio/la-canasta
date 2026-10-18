import { useState } from 'react';
import { CONFIG_APERTURA, OPCIONES_OBJETIVO } from '../../constantes';
import { tramosApertura } from '../../dominio/apertura';
import { useApp } from '../../estado/AppProvider';
import { ModalAviso } from '../../ui/ModalAviso';
import { Toggle } from '../../ui/Toggle';
import type { ModoJuego } from '../../tipos';
import { SelectorIndividual, SelectorParejas } from './componentes/SelectorJugadores';

const MODOS: { id: ModoJuego; titulo: string; detalle: string; icono: string }[] = [
  { id: 'individual', titulo: 'Individual', detalle: 'Todos contra todos (o mano a mano)', icono: '🙋' },
  { id: 'parejas', titulo: 'Grupal (Parejas)', detalle: 'Equipos de 2 jugadores', icono: '🤝' },
];

export function PantallaNuevaPartida() {
  const { setPantallaActual, partida } = useApp();
  const { config, actualizarConfig, comenzarPartida } = partida;
  const [aviso, setAviso] = useState<'jugadores_insuficientes' | 'equipos_incompletos' | null>(null);

  const empezar = () => {
    const resultado = comenzarPartida();
    if (resultado !== 'ok') setAviso(resultado);
  };

  return (
    <main className="flex w-full flex-col gap-5 py-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="block text-[10px] font-black uppercase tracking-widest text-blue-200">Nueva partida</span>
          <h2 className="font-display text-2xl font-black text-white">Configurar mesa</h2>
        </div>
        <button type="button" onClick={() => setPantallaActual('inicio')} className="btn-fantasma px-3 py-2 text-sm">
          ✕ Cancelar
        </button>
      </div>

      <section className="tarjeta p-4">
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-azul">1. Modo de juego</h3>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Modo de juego">
          {MODOS.map((modo) => {
            const activo = config.modo === modo.id;
            return (
              <button
                key={modo.id}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => actualizarConfig({ modo: modo.id })}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center ${
                  activo ? 'border-azul-vivo bg-blue-50 shadow-inner' : 'border-slate-200 bg-white'
                }`}
              >
                <span className="text-2xl">{modo.icono}</span>
                <span className={`text-sm font-black ${activo ? 'text-azul' : 'text-slate-700'}`}>{modo.titulo}</span>
                <span className="text-[11px] font-medium leading-tight text-slate-500">{modo.detalle}</span>
              </button>
            );
          })}
        </div>
      </section>

      {config.modo === 'individual' ? <SelectorIndividual /> : <SelectorParejas />}

      <section className="tarjeta p-4">
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-azul">2. Puntaje para ganar</h3>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Puntaje objetivo">
          {OPCIONES_OBJETIVO.map((opcion) => {
            const activo = config.objetivo === opcion;
            return (
              <button
                key={String(opcion)}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => actualizarConfig({ objetivo: opcion })}
                className={`${activo ? 'btn-primario' : 'btn-claro'} px-3.5 py-2 text-sm`}
              >
                {opcion === null ? 'Sin límite' : opcion.toLocaleString('es-AR')}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-500">Cuando alguien llega a la meta, la app te ofrece cerrar la partida (o seguir jugando).</p>
      </section>

      <section className="tarjeta flex items-start justify-between gap-3 p-4">
        <div>
          <h3 className="text-sm font-black text-tinta">Premios por cantidad de canastas</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Opcional. Canastrón (5 canastas en una ronda): +500. Canasta de canastas (7): +2.000.
          </p>
        </div>
        <Toggle etiqueta="Premios por cantidad de canastas" checked={config.premiosPorCantidad} onChange={(valor) => actualizarConfig({ premiosPorCantidad: valor })} />
      </section>

      <section className="tarjeta tarjeta-acento-azul p-4">
        <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-azul">🔓 Puntos mínimos para abrirse</h3>
        <ul className="flex flex-col gap-1 text-sm text-slate-700">
          {tramosApertura(CONFIG_APERTURA).map((tramo) => (
            <li key={tramo.requisito} className="flex justify-between">
              <span>
                {tramo.desde === null
                  ? `Menos de ${(tramo.hasta! + 1).toLocaleString('es-AR')} pts`
                  : tramo.hasta === null
                    ? `${tramo.desde.toLocaleString('es-AR')} pts o más`
                    : `${tramo.desde.toLocaleString('es-AR')} a ${tramo.hasta.toLocaleString('es-AR')} pts`}
              </span>
              <strong className="text-azul">{tramo.requisito} pts</strong>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">La app lo calcula sola en cada ronda, según el acumulado de cada jugador/equipo.</p>
      </section>

      <button type="button" onClick={empezar} className="btn-secundario w-full py-4 text-lg">
        Empezar partida ➔
      </button>

      <ModalAviso
        abierto={aviso !== null}
        titulo={aviso === 'equipos_incompletos' ? 'Faltan jugadores' : 'Faltan jugadores'}
        mensaje={
          aviso === 'equipos_incompletos'
            ? 'Cada equipo necesita exactamente 2 jugadores. Completá todos los casilleros (o quitá los equipos que sobren).'
            : 'Seleccioná al menos 2 jugadores para comenzar la partida.'
        }
        onCerrar={() => setAviso(null)}
      />
    </main>
  );
}
