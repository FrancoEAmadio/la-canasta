import { useState } from 'react';
import { JUGADORES_POR_EQUIPO, MIN_EQUIPOS } from '../../../constantes';
import { nombreEquipo } from '../../../dominio/partida';
import { useApp } from '../../../estado/AppProvider';
import { estiloElegido, hexColorJugador } from '../../../datos/coloresJugador';
import { AvatarJugador } from '../../../ui/AvatarJugador';
import { ItemOrdenable, ListaOrdenable } from '../../../ui/ListaOrdenable';
import { ModalSeleccionJugadores } from './ModalSeleccionJugadores';

export function SelectorIndividual() {
  const { jugadores, partida } = useApp();
  const { config, alternarSeleccionJugador, borrarSeleccionJugadores, mezclarOrdenIndividual, moverJugadorIndividual } = partida;
  const [abierto, setAbierto] = useState(false);

  const elegir = alternarSeleccionJugador;

  return (
    <section className="tarjeta flex flex-col gap-3 p-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-azul">Jugadores ({config.idsIndividual.length})</h3>
      {config.idsIndividual.length > 0 && (
        <ListaOrdenable ids={config.idsIndividual} onMover={moverJugadorIndividual}>
        <ol className="flex flex-col gap-2">
          {config.idsIndividual.map((id, indice) => {
            const jugador = jugadores.find((candidato) => candidato.id === id);
            if (!jugador) return null;
            return (
              <ItemOrdenable key={id} id={id} className="flex items-center gap-3 rounded-xl border-2 p-2 pr-3" style={estiloElegido(jugador)}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: hexColorJugador(jugador) }}>{indice + 1}</span>
                <AvatarJugador palo={jugador.palo} color={hexColorJugador(jugador)} tamano="sm" />
                <span className="flex-1 truncate font-bold text-tinta">{jugador.nombre}</span>
                <button type="button" onClick={() => elegir(id)} aria-label={`Quitar a ${jugador.nombre}`} className="h-8 w-8 rounded-lg text-lg font-bold text-slate-400 hover:bg-slate-200">
                  ×
                </button>
              </ItemOrdenable>
            );
          })}
        </ol>
        </ListaOrdenable>
      )}
      {config.idsIndividual.length >= 2 && (
        <p className="text-center text-xs font-semibold text-slate-400">Mantené apretado un jugador y arrastralo para cambiar el orden</p>
      )}
      {config.idsIndividual.length >= 2 && (
        <button type="button" onClick={mezclarOrdenIndividual} className="btn-claro py-3 text-sm">
          Ordenar al azar
        </button>
      )}
      <button type="button" onClick={() => setAbierto(true)} className="btn-claro py-3 text-sm">
        {config.idsIndividual.length === 0 ? 'Seleccionar jugadores' : 'Cambiar selección'}
      </button>

      <ModalSeleccionJugadores
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo="Seleccionar jugadores"
        seleccionados={config.idsIndividual}
        onElegir={elegir}
        onBorrarSeleccion={borrarSeleccionJugadores}
      />
    </section>
  );
}

/** Nombre provisorio de un equipo mientras se arma: "Franco y Sol" (o "Franco y …" si falta uno). */
function nombreProvisorio(integrantes: (string | undefined)[], indice: number): string {
  const nombres = integrantes.filter((nombre): nombre is string => !!nombre);
  if (nombres.length === 0) return `Pareja ${indice + 1}`;
  return nombres.length < integrantes.length ? `${nombreEquipo(nombres)} y …` : nombreEquipo(nombres);
}

export function SelectorParejas() {
  const { jugadores, partida } = useApp();
  const { config, asignarEnEquipo, agregarEquipo, quitarEquipo, armarParejasAlAzar, mezclarEquipos, intercambiarCasilleros } = partida;
  const [casillero, setCasillero] = useState<{ equipo: number; slot: number } | null>(null);
  /** Lista de quiénes juegan, mientras se eligen para armar las parejas al azar (null = cerrado). */
  const [eligiendoAzar, setEligiendoAzar] = useState<string[] | null>(null);

  const idsCasilleros = config.equipos.flatMap((equipo, e) => equipo.map((_, s) => `casillero-${e}-${s}`));
  const moverCasillero = (desde: number, hasta: number) => {
    const aCasillero = (indice: number) => {
      const [, e, s] = idsCasilleros[indice]!.split('-');
      return { equipo: Number(e), slot: Number(s) };
    };
    intercambiarCasilleros(aCasillero(desde), aCasillero(hasta));
  };
  const asignados = config.equipos.flat().filter((id): id is string => id !== null);
  const ocupanteActual = casillero ? config.equipos[casillero.equipo]?.[casillero.slot] ?? null : null;

  return (
    <section className="tarjeta flex flex-col gap-3 p-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-azul">Equipos de {JUGADORES_POR_EQUIPO}</h3>

      <ListaOrdenable ids={idsCasilleros} onMover={moverCasillero} intercambio>
      {config.equipos.map((equipo, indiceEquipo) => (
        <div key={indiceEquipo} className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="min-w-0 truncate font-display text-base font-bold text-azul">
              {nombreProvisorio(
                equipo.map((id) => (id ? jugadores.find((candidato) => candidato.id === id)?.nombre : undefined)),
                indiceEquipo
              )}
            </span>
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
                <ItemOrdenable key={slot} id={`casillero-${indiceEquipo}-${slot}`} etiqueta="div" fijo={!jugador}>
                  <button
                    type="button"
                    onClick={() => setCasillero({ equipo: indiceEquipo, slot })}
                    className={`flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 p-2 text-center ${
                      jugador ? '' : 'border-dashed border-slate-300 bg-white text-slate-400'
                    }`}
                    style={jugador ? estiloElegido(jugador) : undefined}
                  >
                    {jugador ? (
                      <>
                        <AvatarJugador palo={jugador.palo} color={hexColorJugador(jugador)} tamano="sm" />
                        <span className="w-full truncate text-sm font-bold text-tinta">{jugador.nombre}</span>
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
                      className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rojo text-sm font-bold text-white shadow"
                    >
                      ×
                    </button>
                  )}
                </ItemOrdenable>
              );
            })}
          </div>
        </div>
      ))}
      </ListaOrdenable>
      {asignados.length >= 2 && (
        <p className="text-center text-xs font-semibold text-slate-400">Mantené apretado un jugador y soltalo sobre otro lugar para intercambiarlos</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={agregarEquipo} className="btn-claro py-2.5 text-xs">
          + Agregar equipo
        </button>
        <button type="button" onClick={() => (asignados.length >= 2 ? mezclarEquipos() : setEligiendoAzar(asignados))} className="btn-claro py-2.5 text-xs">
          Parejas al azar
        </button>
      </div>

      <ModalSeleccionJugadores
        abierto={eligiendoAzar !== null}
        onCerrar={() => {
          if (eligiendoAzar && eligiendoAzar.length >= 2) armarParejasAlAzar(eligiendoAzar);
          setEligiendoAzar(null);
        }}
        titulo="¿Quiénes juegan?"
        seleccionados={eligiendoAzar ?? []}
        onElegir={(id) => setEligiendoAzar((lista) => (lista ? (lista.includes(id) ? lista.filter((otro) => otro !== id) : [...lista, id]) : lista))}
        onBorrarSeleccion={() => setEligiendoAzar([])}
        textoListo="Armar parejas al azar"
      />

      <ModalSeleccionJugadores
        abierto={casillero !== null}
        onCerrar={() => setCasillero(null)}
        titulo={casillero ? `Pareja ${casillero.equipo + 1}` : 'Elegir jugador'}
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
