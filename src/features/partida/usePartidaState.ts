import { useCallback, useMemo, useRef, useState } from 'react';
import {
  JUGADORES_POR_EQUIPO,
  MAX_EQUIPOS,
  MAX_JUGADORES_INDIVIDUAL,
  MIN_EQUIPOS,
  MIN_JUGADORES_INDIVIDUAL,
  PUNTAJE_OBJETIVO_DEFECTO,
} from '../../constantes';
import {
  borradorDesdeRonda,
  calcularRanking,
  crearPartida,
  nuevoBorrador,
  objetivoAlcanzado,
  ordenarPartidas,
  quienMezclaYReparte,
  recortarPartidas,
  totalesHastaRonda,
} from '../../dominio/partida';
import { aplicarPartidaFinalizada } from '../../dominio/estadisticas';
import { calcularEntrada } from '../../dominio/puntuacion';
import { advertenciasRonda } from '../../dominio/validaciones';
import { guardarPartidas, cargarPartidas } from '../../infra/almacenamiento';
import type {
  DesgloseRonda,
  EntradaRonda,
  JugadorPermanente,
  ModoJuego,
  PantallaId,
  Participante,
  PasoPartida,
  Partida,
  Ronda,
} from '../../tipos';

export interface ConfigNuevaPartida {
  modo: ModoJuego;
  idsIndividual: string[];
  /** Cada equipo tiene exactamente 2 casilleros; null = casillero vacío. */
  equipos: (string | null)[][];
  objetivo: number | null;
  premiosPorCantidad: boolean;
}

function crearConfigInicial(): ConfigNuevaPartida {
  return {
    modo: 'individual',
    idsIndividual: [],
    equipos: Array.from({ length: MIN_EQUIPOS }, () => Array<string | null>(JUGADORES_POR_EQUIPO).fill(null)),
    objetivo: PUNTAJE_OBJETIVO_DEFECTO,
    premiosPorCantidad: false,
  };
}

export type ResultadoComenzar = 'ok' | 'jugadores_insuficientes' | 'equipos_incompletos';

interface Parametros {
  setPantallaActual: (pantalla: PantallaId) => void;
  obtenerJugadores: () => JugadorPermanente[];
  reemplazarJugadores: (lista: JugadorPermanente[]) => void;
  alErrorGuardado: () => void;
}

/** Aplica el borrador actual como ronda cerrada (nueva o corrección de una anterior). */
function confirmarBorrador(partida: Partida): Partida {
  const { borrador } = partida;
  const editando = borrador.editandoIdx;
  const ronda: Ronda = {
    numero: editando !== null ? (partida.rondas[editando]?.numero ?? borrador.numero) : partida.rondas.length + 1,
    entradas: borrador.entradas,
  };
  const rondas =
    editando !== null ? partida.rondas.map((existente, indice) => (indice === editando ? ronda : existente)) : [...partida.rondas, ronda];
  return { ...partida, rondas, borrador: nuevoBorrador(rondas.length + 1, partida.participantes) };
}

export function usePartidaState({ setPantallaActual, obtenerJugadores, reemplazarJugadores, alErrorGuardado }: Parametros) {
  const [partidas, setPartidas] = useState<Partida[]>(cargarPartidas);
  const partidasRef = useRef(partidas);
  const [activaId, setActivaId] = useState<string | null>(null);
  const [config, setConfig] = useState<ConfigNuevaPartida>(crearConfigInicial);

  const guardarEstado = useCallback(
    (nuevas: Partida[]) => {
      const recortadas = recortarPartidas(nuevas);
      partidasRef.current = recortadas;
      setPartidas(recortadas);
      if (!guardarPartidas(recortadas)) alErrorGuardado();
    },
    [alErrorGuardado]
  );

  const mutarPartida = useCallback(
    (id: string, transformar: (partida: Partida) => Partida) => {
      guardarEstado(
        partidasRef.current.map((partida) =>
          partida.id === id ? { ...transformar(partida), actualizada: new Date().toISOString() } : partida
        )
      );
    },
    [guardarEstado]
  );

  const partidaActiva = useMemo(() => partidas.find((partida) => partida.id === activaId) ?? null, [partidas, activaId]);

  const enCurso = useMemo(() => ordenarPartidas(partidas.filter((partida) => partida.estado === 'en_curso')), [partidas]);

  // ───────────────────────── Configuración de nueva partida ─────────────────────────
  const irANuevaPartida = useCallback(() => {
    setConfig(crearConfigInicial());
    setPantallaActual('nueva_partida');
  }, [setPantallaActual]);

  const actualizarConfig = useCallback((parcial: Partial<ConfigNuevaPartida>) => {
    setConfig((actual) => ({ ...actual, ...parcial }));
  }, []);

  const alternarSeleccionJugador = useCallback((id: string): 'ok' | 'limite_alcanzado' => {
    let resultado: 'ok' | 'limite_alcanzado' = 'ok';
    setConfig((actual) => {
      if (actual.idsIndividual.includes(id)) {
        return { ...actual, idsIndividual: actual.idsIndividual.filter((existente) => existente !== id) };
      }
      if (actual.idsIndividual.length >= MAX_JUGADORES_INDIVIDUAL) {
        resultado = 'limite_alcanzado';
        return actual;
      }
      return { ...actual, idsIndividual: [...actual.idsIndividual, id] };
    });
    return resultado;
  }, []);

  const asignarEnEquipo = useCallback((equipoIdx: number, casillero: number, jugadorId: string | null) => {
    setConfig((actual) => {
      const equipos = actual.equipos.map((equipo) =>
        equipo.map((ocupante) => (jugadorId !== null && ocupante === jugadorId ? null : ocupante))
      );
      if (equipos[equipoIdx]) equipos[equipoIdx]![casillero] = jugadorId;
      return { ...actual, equipos };
    });
  }, []);

  const agregarEquipo = useCallback(() => {
    setConfig((actual) =>
      actual.equipos.length >= MAX_EQUIPOS
        ? actual
        : { ...actual, equipos: [...actual.equipos, Array<string | null>(JUGADORES_POR_EQUIPO).fill(null)] }
    );
  }, []);

  const quitarEquipo = useCallback((equipoIdx: number) => {
    setConfig((actual) =>
      actual.equipos.length <= MIN_EQUIPOS ? actual : { ...actual, equipos: actual.equipos.filter((_, indice) => indice !== equipoIdx) }
    );
  }, []);

  /** Reparte al azar a los jugadores ya elegidos entre los casilleros de los equipos. */
  const mezclarEquipos = useCallback(() => {
    setConfig((actual) => {
      const ids = actual.equipos.flat().filter((id): id is string => id !== null);
      for (let i = ids.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j]!, ids[i]!];
      }
      let siguiente = 0;
      const equipos = actual.equipos.map((equipo) => equipo.map(() => ids[siguiente++] ?? null));
      return { ...actual, equipos };
    });
  }, []);

  const comenzarPartida = useCallback((): ResultadoComenzar => {
    const jugadores = obtenerJugadores();
    const buscar = (id: string) => jugadores.find((jugador) => jugador.id === id);
    let participantes: Participante[] = [];

    if (config.modo === 'individual') {
      const elegidos = config.idsIndividual.map(buscar).filter((jugador): jugador is JugadorPermanente => !!jugador);
      if (elegidos.length < MIN_JUGADORES_INDIVIDUAL) return 'jugadores_insuficientes';
      participantes = elegidos.map((jugador) => ({
        id: jugador.id,
        nombre: jugador.nombre,
        jugadoresIds: [jugador.id],
        jugadoresNombres: [jugador.nombre],
      }));
    } else {
      const completos = config.equipos.every((equipo) => equipo.every((id) => id !== null && !!buscar(id)));
      if (!completos || config.equipos.length < MIN_EQUIPOS) return 'equipos_incompletos';
      participantes = config.equipos.map((equipo, indice) => {
        const miembros = equipo.map((id) => buscar(id!)!);
        return {
          id: `equipo_${indice + 1}`,
          nombre: `Equipo ${indice + 1}`,
          jugadoresIds: miembros.map((jugador) => jugador.id),
          jugadoresNombres: miembros.map((jugador) => jugador.nombre),
        };
      });
    }

    const nueva = crearPartida({
      modo: config.modo,
      participantes,
      objetivo: config.objetivo,
      reglas: { premiosPorCantidad: config.premiosPorCantidad },
    });
    guardarEstado([...partidasRef.current, nueva]);
    setActivaId(nueva.id);
    setPantallaActual('partida');
    return 'ok';
  }, [config, guardarEstado, obtenerJugadores, setPantallaActual]);

  const reanudarPartida = useCallback(
    (id: string) => {
      setActivaId(id);
      setPantallaActual('partida');
    },
    [setPantallaActual]
  );

  const eliminarPartida = useCallback(
    (id: string) => {
      guardarEstado(partidasRef.current.filter((partida) => partida.id !== id));
      setActivaId((actual) => (actual === id ? null : actual));
    },
    [guardarEstado]
  );

  const borrarFinalizadas = useCallback(() => {
    guardarEstado(partidasRef.current.filter((partida) => partida.estado === 'en_curso'));
  }, [guardarEstado]);

  const reemplazarTodas = useCallback(
    (lista: Partida[]) => {
      guardarEstado(lista);
      setActivaId(null);
    },
    [guardarEstado]
  );

  // ───────────────────────── Partida en juego ─────────────────────────
  const irAPaso = useCallback(
    (paso: PasoPartida) => {
      if (!activaId) return;
      mutarPartida(activaId, (partida) => ({ ...partida, borrador: { ...partida.borrador, paso } }));
    },
    [activaId, mutarPartida]
  );

  const seleccionarParticipante = useCallback(
    (indice: number) => {
      if (!activaId) return;
      mutarPartida(activaId, (partida) => ({
        ...partida,
        borrador: {
          ...partida.borrador,
          seleccionIdx: Math.max(0, Math.min(partida.participantes.length - 1, indice)),
        },
      }));
    },
    [activaId, mutarPartida]
  );

  const modificarEntrada = useCallback(
    (participanteId: string, transformar: (entrada: EntradaRonda) => EntradaRonda) => {
      if (!activaId) return;
      mutarPartida(activaId, (partida) => {
        const actual = partida.borrador.entradas[participanteId];
        if (!actual) return partida;
        return {
          ...partida,
          borrador: {
            ...partida.borrador,
            entradas: { ...partida.borrador.entradas, [participanteId]: transformar(actual) },
          },
        };
      });
    },
    [activaId, mutarPartida]
  );

  /** "Corte exacto" y "Cerró la ronda" solo pueden pertenecer a un participante por ronda. */
  const alternarBonoExclusivo = useCallback(
    (clave: 'corteExacto' | 'cerro', participanteId: string) => {
      if (!activaId) return;
      mutarPartida(activaId, (partida) => {
        const teniaBono = partida.borrador.entradas[participanteId]?.[clave] === true;
        const entradas: Record<string, EntradaRonda> = {};
        for (const [id, entrada] of Object.entries(partida.borrador.entradas)) {
          let nueva: EntradaRonda = { ...entrada, [clave]: id === participanteId ? !teniaBono : false };
          // En individual, quien cierra se quedó sin cartas: su mano queda en cero.
          if (clave === 'cerro' && partida.modo === 'individual' && id === participanteId && !teniaBono) {
            nueva = { ...nueva, cartasMano: { tresNegros: 0, c5: 0, c10: 0, c20: 0, c50: 0 } };
          }
          entradas[id] = nueva;
        }
        return { ...partida, borrador: { ...partida.borrador, entradas } };
      });
    },
    [activaId, mutarPartida]
  );

  const iniciarEdicionRonda = useCallback(
    (indice: number) => {
      if (!activaId) return;
      mutarPartida(activaId, (partida) => {
        const ronda = partida.rondas[indice];
        if (!ronda) return partida;
        return { ...partida, borrador: borradorDesdeRonda(ronda, indice, partida.participantes) };
      });
    },
    [activaId, mutarPartida]
  );

  const cancelarEdicion = useCallback(() => {
    if (!activaId) return;
    mutarPartida(activaId, (partida) => ({
      ...partida,
      borrador: nuevoBorrador(partida.rondas.length + 1, partida.participantes),
    }));
  }, [activaId, mutarPartida]);

  const eliminarUltimaRonda = useCallback(() => {
    if (!activaId) return;
    mutarPartida(activaId, (partida) => {
      const rondas = partida.rondas.slice(0, -1);
      return { ...partida, rondas, borrador: nuevoBorrador(rondas.length + 1, partida.participantes) };
    });
  }, [activaId, mutarPartida]);

  /** Cierra la ronda actual (o guarda la corrección) y deja lista la siguiente. */
  const confirmarRonda = useCallback(() => {
    if (!activaId) return;
    mutarPartida(activaId, confirmarBorrador);
  }, [activaId, mutarPartida]);

  /**
   * Finaliza la partida activa y suma el resultado a las estadísticas de los jugadores.
   * Con `incluirBorrador` primero cierra la ronda que se estaba cargando.
   */
  const finalizarPartida = useCallback(
    (incluirBorrador = false): boolean => {
      if (!activaId) return false;
      const partida = partidasRef.current.find((candidata) => candidata.id === activaId);
      if (!partida || partida.estado !== 'en_curso') return false;

      const base = incluirBorrador ? confirmarBorrador(partida) : partida;
      if (base.rondas.length === 0) return false;

      const ahora = new Date().toISOString();
      const finalizada: Partida = { ...base, estado: 'finalizada', finalizadaEn: ahora, actualizada: ahora };

      reemplazarJugadores(aplicarPartidaFinalizada(obtenerJugadores(), finalizada));
      guardarEstado(partidasRef.current.map((candidata) => (candidata.id === finalizada.id ? finalizada : candidata)));
      return true;
    },
    [activaId, guardarEstado, obtenerJugadores, reemplazarJugadores]
  );

  const soltarPartidaActiva = useCallback(() => setActivaId(null), []);

  // ───────────────────────── Datos derivados para la pantalla ─────────────────────────
  const vista = useMemo(() => {
    if (!partidaActiva) return null;
    const { borrador } = partidaActiva;
    const rondasBase = borrador.editandoIdx ?? partidaActiva.rondas.length;
    const totalesCerrados = totalesHastaRonda(partidaActiva, partidaActiva.rondas.length);
    /** Puntaje acumulado al INICIO de la ronda visible: define el requisito para abrirse. */
    const totalesInicioRonda = totalesHastaRonda(partidaActiva, rondasBase);

    const desgloses: Record<string, DesgloseRonda> = {};
    const totalesConBorrador: Record<string, number> = {};
    for (const participante of partidaActiva.participantes) {
      const entrada = borrador.entradas[participante.id]!;
      desgloses[participante.id] = calcularEntrada(entrada, partidaActiva.reglas);
      totalesConBorrador[participante.id] = (totalesInicioRonda[participante.id] ?? 0) + desgloses[participante.id]!.total;
    }

    const rondasPosteriores = partidaActiva.rondas.slice(rondasBase + (borrador.editandoIdx !== null ? 1 : 0));
    // Al corregir una ronda anterior, las rondas posteriores también cuentan para el objetivo.
    const totalesFinales = { ...totalesConBorrador };
    for (const ronda of rondasPosteriores) {
      for (const participante of partidaActiva.participantes) {
        const entrada = ronda.entradas[participante.id];
        if (entrada) totalesFinales[participante.id]! += calcularEntrada(entrada, partidaActiva.reglas).total;
      }
    }

    return {
      numeroRonda: borrador.numero,
      totalesCerrados,
      totalesInicioRonda,
      desgloses,
      totalesConBorrador,
      totalesFinales,
      meta: objetivoAlcanzado(partidaActiva.objetivo, totalesFinales),
      metaYaAlcanzadaCerrada: objetivoAlcanzado(partidaActiva.objetivo, totalesCerrados) && partidaActiva.rondas.length > 0,
      advertencias: advertenciasRonda(partidaActiva.participantes, borrador.entradas),
      quienReparte: quienMezclaYReparte(partidaActiva, borrador.numero),
      rankingCerrado: calcularRanking(partidaActiva, totalesCerrados),
    };
  }, [partidaActiva]);

  return {
    partidas,
    partidaActiva,
    activaId,
    enCurso,
    hayPartidaEnCurso: enCurso.length > 0,
    vista,

    config,
    actualizarConfig,
    alternarSeleccionJugador,
    asignarEnEquipo,
    agregarEquipo,
    quitarEquipo,
    mezclarEquipos,
    irANuevaPartida,
    comenzarPartida,

    reanudarPartida,
    eliminarPartida,
    borrarFinalizadas,
    reemplazarTodas,
    soltarPartidaActiva,

    irAPaso,
    seleccionarParticipante,
    modificarEntrada,
    alternarBonoExclusivo,
    iniciarEdicionRonda,
    cancelarEdicion,
    eliminarUltimaRonda,
    confirmarRonda,
    finalizarPartida,
  };
}

export type PartidaState = ReturnType<typeof usePartidaState>;
