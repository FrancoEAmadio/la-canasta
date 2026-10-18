import { useState } from 'react';
import { JUGADORES_POR_EQUIPO, MAX_EQUIPOS, MAX_JUGADORES_INDIVIDUAL, MIN_EQUIPOS } from '../../../constantes';
import { useApp } from '../../../estado/AppProvider';
import { AvatarJugador } from '../../../ui/AvatarJugador';
import { ModalAviso } from '../../../ui/ModalAviso';
import { ModalSeleccionJugadores } from './ModalSeleccionJugadores';

export function SelectorIndividual() {
  const { jugadores, partida } = useApp();
  const { config, alternarSeleccionJugador } = partida;
  const [abierto, setAbierto] = useState(false);
  const [limite, setLimite] = useState(false);

  const elegir = (id: string) => {
    if (alternarSeleccionJugador(id) === 'limite_alcanzado') setLimite(true);
  };

  return (
    <section className="tarjeta flex flex-col gap-3 p-4">
      <h3 className="text-sm font-black uppercase tracking-wider text-azul">Jugadores ({config.idsIndividual.length}/{MAX_JUGADORES_INDIVIDUAL})</h3>
      {config.idsIndividual.length > 0 && (
        <ol className="flex flex-col gap-2">
          {config.idsIndividual.map((id, indice) => {
            const jugador = jugadores.find((candidato) => candidato.id === id);
            if (!jugador) return null;
            return (
              <li key={id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2 pr-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-azul-vivo text-xs font-black text-white">{indice + 1}</span>
                <AvatarJugador palo={jugador.palo} tamano="sm" />
                <span className="flex-1 truncate font-bold text-tinta">{jugador.nombre}</span>
                <button type="button" onClick={() => elegir(id)} aria-label={`Quitar a ${jugador.nombre}`} className="h-8 w-8 rounded-lg text-lg font-bold text-slate-400 hover:bg-slate-200">
                  ×
                </button>
              </li>
            );
          })}
        </ol>
      )}
      <button type="button" onClick={() => setAbierto(true)} className="btn-claro py-3 text-sm">
        {config.idsIndividual.length === 0 ? '👥 Seleccionar jugadores' : '✏️ Cambiar selección'}
      </button>

      <ModalSeleccionJugadores
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo="Seleccionar jugadores"
        seleccionados={config.idsIndividual}
        maximo={MAX_JUGADORES_INDIVIDUAL}
        onElegir={elegir}
      />
      <ModalAviso
        abierto={limite}
        titulo="Límite alcanzado"
        mensaje={`En modo individual pueden jugar hasta ${MAX_JUGADORES_INDIVIDUAL} personas.`}
        textoBoton="OK"
        onCerrar={() => setLimite(false)}
      />
    </section>
  );
}

export function SelectorParejas() {
  const { jugadores, partida } = useApp();
  const { config, asignarEnEquipo, agregarEquipo, quitarEquipo, mezclarEquipos } = partida;
  const [casillero, setCasillero] = useState<{ equipo: number; slot: number } | null>(null);

  const asignados = config.equipos.flat().filter((id): id is string => id !== null);
  const ocupanteActual = casillero ? config.equipos[casillero.equipo]?.[casillero.slot] ?? null : null;

  return (
    <section className="tarjeta flex flex-col gap-3 p-4">
      <h3 className="text-sm font-black uppercase tracking-wider text-azul">Equipos de {JUGADORES_POR_EQUIPO}</h3>

      {config.equipos.map((equipo, indiceEquipo) => (
        <div key={indiceEquipo} className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-base font-black text-azul">Equipo {indiceEquipo + 1}</span>
            {config.equipos.length > MIN_EQUIPOS && (
              <button type="button" onClick={() => quitarEquipo(indiceEquipo)} className="text-xs font-bold text-rojo-osc">
                Quitar equipo
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {equipo.map((jugadorId, slot) => {
              const jugador = jugadorId ? jugadores.find((candidato) => candidato.id === jugadorId) : null;
              return (
                <div key={slot} className="relative">
                  <button
                    type="button"
                    onClick={() => setCasillero({ equipo: indiceEquipo, slot })}
                    className={`flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 p-2 text-center ${
                      jugador ? 'border-azul-vivo bg-white' : 'border-dashed border-slate-300 bg-white text-slate-400'
                    }`}
                  >
                    {jugador ? (
                      <>
                        <AvatarJugador palo={jugador.palo} tamano="sm" />
                        <span className="w-full truncate text-sm font-black text-tinta">{jugador.nombre}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold">+ Elegir jugador</span>
                    )}
                  </button>
                  {jugador && (
                    <button
                      type="button"
                      onClick={() => asignarEnEquipo(indiceEquipo, slot, null)}
                      aria-label={`Quitar a ${jugador.nombre} del equipo`}
                      className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rojo text-sm font-black text-white shadow"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={agregarEquipo} disabled={config.equipos.length >= MAX_EQUIPOS} className="btn-claro py-2.5 text-xs">
          + Agregar equipo
        </button>
        <button type="button" onClick={mezclarEquipos} disabled={asignados.length < 2} className="btn-claro py-2.5 text-xs">
          🎲 Parejas al azar
        </button>
      </div>

      <ModalSeleccionJugadores
        abierto={casillero !== null}
        onCerrar={() => setCasillero(null)}
        titulo={casillero ? `Equipo ${casillero.equipo + 1}` : 'Elegir jugador'}
        seleccionados={ocupanteActual ? [ocupanteActual] : []}
        excluidos={asignados.filter((id) => id !== ocupanteActual)}
        unico
        onElegir={(id) => {
          if (casillero) asignarEnEquipo(casillero.equipo, casillero.slot, id);
        }}
      />
    </section>
  );
}
