import { MAX_PARTIDAS_EVOLUCION } from '../constantes.ts';
import type {
  EstadisticasJugador,
  JugadorPermanente,
  ModoJuego,
  Palo,
  Participante,
  Partida,
} from '../tipos/index.ts';
import { calcularRanking, generarId } from './partida.ts';
import { calcularEntrada } from './puntuacion.ts';

export const PALOS: Palo[] = ['picas', 'corazones', 'diamantes', 'treboles'];

export function crearEstadisticasVacias(): EstadisticasJugador {
  return {
    partidasJugadas: 0,
    victorias: 0,
    sumaPuntos: 0,
    mejorPartida: null,
    canastasPuras: 0,
    canastasImpuras: 0,
    canastasComodines: 0,
    tresRojos: 0,
    cierres: 0,
    cortesExactos: 0,
    porModo: {
      individual: { jugadas: 0, victorias: 0 },
      parejas: { jugadas: 0, victorias: 0 },
    },
  };
}

export function crearJugadorPermanente(nombre: string, palo: Palo = 'picas'): JugadorPermanente {
  return {
    id: generarId('jugador'),
    nombre: nombre.trim() || 'Jugador',
    palo,
    estadisticas: crearEstadisticasVacias(),
    evolucion: [],
  };
}

export function calcularPorcentajeVictorias(jugador: JugadorPermanente): number {
  const { partidasJugadas, victorias } = jugador.estadisticas;
  if (!partidasJugadas) return 0;
  return Math.round((victorias / partidasJugadas) * 100);
}

export function calcularPorcentajeVictoriasModo(jugador: JugadorPermanente, modo: ModoJuego): number {
  const { jugadas, victorias } = jugador.estadisticas.porModo[modo];
  if (!jugadas) return 0;
  return Math.round((victorias / jugadas) * 100);
}

export function calcularPromedioPuntos(jugador: JugadorPermanente): number {
  const { partidasJugadas, sumaPuntos } = jugador.estadisticas;
  if (!partidasJugadas) return 0;
  return Math.round(sumaPuntos / partidasJugadas);
}

export interface ResumenParticipante {
  puntos: number;
  puras: number;
  impuras: number;
  comodines: number;
  tresRojos: number;
  cierres: number;
  cortesExactos: number;
}

/** Totales de un participante a lo largo de todas las rondas cerradas de una partida. */
export function resumirParticipante(partida: Partida, participante: Participante): ResumenParticipante {
  const resumen: ResumenParticipante = { puntos: 0, puras: 0, impuras: 0, comodines: 0, tresRojos: 0, cierres: 0, cortesExactos: 0 };
  for (const ronda of partida.rondas) {
    const entrada = ronda.entradas[participante.id];
    if (!entrada) continue;
    const desglose = calcularEntrada(entrada, partida.reglas);
    resumen.puntos += desglose.total;
    resumen.puras += desglose.conteo.puras;
    resumen.impuras += desglose.conteo.impuras;
    resumen.comodines += desglose.conteo.comodines;
    resumen.tresRojos += entrada.tresRojos;
    if (entrada.cerro) resumen.cierres += 1;
    if (entrada.corteExacto) resumen.cortesExactos += 1;
  }
  return resumen;
}

export function aplicarFinDePartida(
  jugador: JugadorPermanente,
  datos: { fecha: string; modo: ModoJuego; posicion: number; resumen: ResumenParticipante }
): JugadorPermanente {
  const { fecha, modo, posicion, resumen } = datos;
  const previas = jugador.estadisticas;
  const gano = posicion === 1;

  const estadisticas: EstadisticasJugador = {
    partidasJugadas: previas.partidasJugadas + 1,
    victorias: previas.victorias + (gano ? 1 : 0),
    sumaPuntos: previas.sumaPuntos + resumen.puntos,
    mejorPartida: previas.mejorPartida === null ? resumen.puntos : Math.max(previas.mejorPartida, resumen.puntos),
    canastasPuras: previas.canastasPuras + resumen.puras,
    canastasImpuras: previas.canastasImpuras + resumen.impuras,
    canastasComodines: previas.canastasComodines + resumen.comodines,
    tresRojos: previas.tresRojos + resumen.tresRojos,
    cierres: previas.cierres + resumen.cierres,
    cortesExactos: previas.cortesExactos + resumen.cortesExactos,
    porModo: {
      ...previas.porModo,
      [modo]: {
        jugadas: previas.porModo[modo].jugadas + 1,
        victorias: previas.porModo[modo].victorias + (gano ? 1 : 0),
      },
    },
  };

  const evolucion = [...jugador.evolucion, { fecha, puntos: resumen.puntos, posicion, modo }].slice(-MAX_PARTIDAS_EVOLUCION);
  return { ...jugador, estadisticas, evolucion };
}

/**
 * Aplica el resultado de una partida finalizada a las tarjetas de los jugadores.
 * En parejas, cada integrante recibe el resultado completo del equipo.
 */
export function aplicarPartidaFinalizada(jugadores: JugadorPermanente[], partida: Partida): JugadorPermanente[] {
  const fecha = partida.finalizadaEn ?? partida.actualizada;
  let resultado = jugadores;
  for (const fila of calcularRanking(partida)) {
    const resumen = resumirParticipante(partida, fila.participante);
    for (const jugadorId of fila.participante.jugadoresIds) {
      resultado = resultado.map((jugador) =>
        jugador.id === jugadorId
          ? aplicarFinDePartida(jugador, { fecha, modo: partida.modo, posicion: fila.posicion, resumen })
          : jugador
      );
    }
  }
  return resultado;
}
