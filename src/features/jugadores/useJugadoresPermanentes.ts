import { useCallback, useRef, useState } from 'react';
import { PALOS, crearJugadorPermanente } from '../../dominio/estadisticas';
import { cargarJugadores, guardarJugadores } from '../../infra/almacenamiento';
import type { JugadorPermanente, Palo } from '../../tipos';

export type ResultadoCrear =
  | { ok: true; jugador: JugadorPermanente }
  | { ok: false; motivo: 'vacio' | 'duplicado' };

function normalizar(nombre: string): string {
  return nombre.trim().toLocaleLowerCase('es');
}

export function useJugadoresPermanentes(alErrorGuardado: () => void) {
  const [jugadores, setJugadores] = useState<JugadorPermanente[]>(cargarJugadores);
  // Referencia siempre actualizada: evita perder datos si se llama a varias acciones seguidas.
  const listaRef = useRef(jugadores);

  const persistir = useCallback(
    (nuevos: JugadorPermanente[]) => {
      listaRef.current = nuevos;
      setJugadores(nuevos);
      if (!guardarJugadores(nuevos)) alErrorGuardado();
    },
    [alErrorGuardado]
  );

  const crear = useCallback(
    (nombre: string, palo?: Palo): ResultadoCrear => {
      const limpio = nombre.trim();
      if (!limpio) return { ok: false, motivo: 'vacio' };
      if (listaRef.current.some((jugador) => normalizar(jugador.nombre) === normalizar(limpio))) {
        return { ok: false, motivo: 'duplicado' };
      }
      const paloElegido = palo ?? PALOS[listaRef.current.length % PALOS.length]!;
      const nuevo = crearJugadorPermanente(limpio, paloElegido);
      persistir([...listaRef.current, nuevo]);
      return { ok: true, jugador: nuevo };
    },
    [persistir]
  );

  const editar = useCallback(
    (id: string, nombre: string, palo: Palo): 'ok' | 'vacio' | 'duplicado' => {
      const limpio = nombre.trim();
      if (!limpio) return 'vacio';
      if (listaRef.current.some((jugador) => jugador.id !== id && normalizar(jugador.nombre) === normalizar(limpio))) {
        return 'duplicado';
      }
      persistir(listaRef.current.map((jugador) => (jugador.id === id ? { ...jugador, nombre: limpio, palo } : jugador)));
      return 'ok';
    },
    [persistir]
  );

  const eliminar = useCallback(
    (id: string) => {
      persistir(listaRef.current.filter((jugador) => jugador.id !== id));
    },
    [persistir]
  );

  const reemplazarLista = useCallback(
    (lista: JugadorPermanente[]) => {
      persistir(lista);
    },
    [persistir]
  );

  const obtenerLista = useCallback(() => listaRef.current, []);

  return { jugadores, crear, editar, eliminar, reemplazarLista, obtenerLista };
}
