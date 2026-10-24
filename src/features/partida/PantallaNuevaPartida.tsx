import { useState } from 'react';
import { MAZOS_MAX, MAZOS_MIN, limitesMazo } from '../../constantes';
import { useApp } from '../../estado/AppProvider';
import { CampoNumero } from '../../ui/CampoNumero';
import { ModalAviso } from '../../ui/ModalAviso';
import type { ModoJuego } from '../../tipos';
import { EditorApertura } from './componentes/EditorApertura';
import { EditorPremioCanastas } from './componentes/EditorPremioCanastas';
import { SelectorIndividual, SelectorParejas } from './componentes/SelectorJugadores';
import type { ResultadoComenzar } from './usePartidaState';

const MODOS: { id: ModoJuego; titulo: string; detalle: string; icono: string }[] = [
  { id: 'individual', titulo: 'Individual', detalle: 'Todos contra todos (o mano a mano)', icono: '🙋' },
  { id: 'parejas', titulo: 'Grupal (Parejas)', detalle: 'Equipos de 2 jugadores', icono: '🤝' },
];

const TITULOS_AVISO: Record<Exclude<ResultadoComenzar, 'ok'>, string> = {
  jugadores_insuficientes: 'Faltan jugadores',
  equipos_incompletos: 'Faltan jugadores',
  mazos_invalidos: 'Cantidad de mazos',
  objetivo_invalido: 'Puntaje para ganar',
  apertura_invalida: 'Mínimos para abrirse',
  premio_invalido: 'Premio por canastas',
};

const MENSAJES_AVISO: Record<Exclude<ResultadoComenzar, 'ok'>, string> = {
  jugadores_insuficientes: 'Seleccioná al menos 2 jugadores para comenzar la partida.',
  equipos_incompletos: 'Cada equipo necesita exactamente 2 jugadores. Completá todos los casilleros (o quitá los equipos que sobren).',
  mazos_invalidos: `La cantidad de mazos tiene que ser un número par entre ${MAZOS_MIN} y ${MAZOS_MAX} (2, 4, 6…).`,
  objetivo_invalido: 'El puntaje para ganar tiene que ser mayor que cero (o dejalo vacío para jugar sin límite).',
  apertura_invalida: 'En los mínimos para abrirse, los límites de puntaje tienen que ir de menor a mayor.',
  premio_invalido: 'Completá la cantidad de canastas (1 o más) y los puntos del premio, o desactivá el premio.',
};

export function PantallaNuevaPartida() {
  const { setPantallaActual, partida } = useApp();
  const { config, actualizarConfig, comenzarPartida } = partida;
  const [aviso, setAviso] = useState<Exclude<ResultadoComenzar, 'ok'> | null>(null);

  const empezar = () => {
    const resultado = comenzarPartida();
    if (resultado !== 'ok') setAviso(resultado);
  };

  return (
    <main className="flex w-full flex-col gap-5 pt-5 pb-[calc(90px+env(safe-area-inset-bottom))]">
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
        <CampoNumero
          valor={config.objetivo}
          onCambiar={(objetivo) => actualizarConfig({ objetivo })}
          etiqueta="Puntaje para ganar"
          min={1}
          step={500}
          placeholder="Sin límite"
          grande
        />
        <p className="mt-2 text-xs text-slate-500">
          Escribí a cuántos puntos se juega. Cuando alguien llega a la meta, la app te ofrece cerrar la partida (o seguir jugando). Dejalo vacío para jugar sin límite.
        </p>
      </section>

      <section className="tarjeta p-4">
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-azul">3. Cantidad de mazos</h3>
        <CampoNumero
          valor={config.mazos}
          onCambiar={(mazos) => actualizarConfig({ mazos })}
          etiqueta="Cantidad de mazos"
          min={MAZOS_MIN}
          max={MAZOS_MAX}
          step={2}
          placeholder="4"
          grande
        />
        <p className="mt-2 text-xs text-slate-500">
          Siempre par ({MAZOS_MIN}, 4, 6…). Cada mazo suma 52 cartas + 2 Jokers.
          {config.mazos !== null && config.mazos >= MAZOS_MIN && config.mazos % 2 === 0 && config.mazos <= MAZOS_MAX && (
            <>
              {' '}
              Máximos al anotar: Tres Rojos y Negros {limitesMazo(config.mazos).tresRojos}, cartas de 5 → {limitesMazo(config.mazos).c5}, de 10 → {limitesMazo(config.mazos).c10}, Ases y los dos → {limitesMazo(config.mazos).c20}, Jokers → {limitesMazo(config.mazos).c50}.
            </>
          )}
        </p>
      </section>

      <section className="tarjeta p-4">
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-azul">🧺 Premio por cantidad de canastas</h3>
        <EditorPremioCanastas
          activo={config.premioActivo}
          cantidad={config.premioCantidad}
          puntos={config.premioPuntos}
          onCambiar={(cambios) =>
            actualizarConfig({
              ...(cambios.activo !== undefined && { premioActivo: cambios.activo }),
              ...(cambios.cantidad !== undefined && { premioCantidad: cambios.cantidad }),
              ...(cambios.puntos !== undefined && { premioPuntos: cambios.puntos }),
            })
          }
        />
      </section>

      <section className="tarjeta tarjeta-acento-azul p-4">
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-azul">🔓 Ajustes de reglas: mínimos para abrirse</h3>
        <EditorApertura
          umbrales={config.aperturaUmbrales}
          requisitos={config.aperturaRequisitos}
          onCambiar={(aperturaUmbrales, aperturaRequisitos) => actualizarConfig({ aperturaUmbrales, aperturaRequisitos })}
        />
        <p className="mt-2 text-xs text-slate-500">
          Puntos mínimos que hay que bajar para abrirse / levantar el pozo, según el acumulado de cada jugador/equipo. La app lo calcula sola en cada ronda y podés cambiarlo después desde el menú de la partida.
        </p>
      </section>

      <button type="button" onClick={empezar} className="btn-secundario w-full py-4 text-lg">
        Empezar partida ➔
      </button>

      <ModalAviso
        abierto={aviso !== null}
        titulo={TITULOS_AVISO[aviso ?? 'jugadores_insuficientes']}
        mensaje={MENSAJES_AVISO[aviso ?? 'jugadores_insuficientes']}
        onCerrar={() => setAviso(null)}
      />
    </main>
  );
}
