import { MAX_PARTIDAS_FINALIZADAS } from '../constantes.ts';
import type {
  BorradorRonda,
  FilaRanking,
  ModoJuego,
  Participante,
  Partida,
  ReglasPartida,
  Ronda,
} from '../tipos/index.ts';
import { calcularEntrada, clonarEntrada, crearEntradaVacia } from './puntuacion.ts';

export function generarId(prefijo: string): string {
  return `${prefijo}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nuevoBorrador(numero: number, participantes: Participante[]): BorradorRonda {
  const entradas: BorradorRonda['entradas'] = {};
  for (const participante of participantes) entradas[participante.id] = crearEntradaVacia();
  return { numero, entradas, paso: 'mesa', seleccionIdx: 0, editandoIdx: null };
}

/** Borrador cargado con los datos de una ronda ya cerrada (para corregirla). */
export function borradorDesdeRonda(ronda: Ronda, indice: number, participantes: Participante[]): BorradorRonda {
  const entradas: BorradorRonda['entradas'] = {};
  for (const participante of participantes) {
    const original = ronda.entradas[participante.id];
    entradas[participante.id] = original ? clonarEntrada(original) : crearEntradaVacia();
  }
  return { numero: ronda.numero, entradas, paso: 'puntos', seleccionIdx: 0, editandoIdx: indice };
}

/** Orden de asientos: en parejas se alternan los equipos (A1, B1, A2, B2…). */
export function calcularOrdenMesa(modo: ModoJuego, participantes: Participante[]): string[] {
  if (modo === 'individual') return participantes.map((participante) => participante.nombre);
  const orden: string[] = [];
  const maxIntegrantes = Math.max(...participantes.map((participante) => participante.jugadoresNombres.length));
  for (let posicion = 0; posicion < maxIntegrantes; posicion += 1) {
    for (const participante of participantes) {
      const nombre = participante.jugadoresNombres[posicion];
      if (nombre) orden.push(nombre);
    }
  }
  return orden;
}

interface DatosNuevaPartida {
  modo: ModoJuego;
  participantes: Participante[];
  objetivo: number | null;
  reglas: ReglasPartida;
}

export function crearPartida({ modo, participantes, objetivo, reglas }: DatosNuevaPartida): Partida {
  const ahora = new Date().toISOString();
  return {
    id: generarId('partida'),
    creada: ahora,
    actualizada: ahora,
    finalizadaEn: null,
    estado: 'en_curso',
    modo,
    objetivo,
    reglas,
    participantes,
    ordenMesa: calcularOrdenMesa(modo, participantes),
    rondas: [],
    borrador: nuevoBorrador(1, participantes),
  };
}

/** Puntaje acumulado de cada participante sumando las primeras `cantidadRondas` rondas cerradas. */
export function totalesHastaRonda(partida: Partida, cantidadRondas: number): Record<string, number> {
  const totales: Record<string, number> = {};
  for (const participante of partida.participantes) totales[participante.id] = 0;
  for (const ronda of partida.rondas.slice(0, cantidadRondas)) {
    for (const participante of partida.participantes) {
      const entrada = ronda.entradas[participante.id];
      if (entrada) totales[participante.id]! += calcularEntrada(entrada, partida.reglas).total;
    }
  }
  return totales;
}

export function totalesPartida(partida: Partida): Record<string, number> {
  return totalesHastaRonda(partida, partida.rondas.length);
}

/** Ranking ordenado de mayor a menor; los empates comparten posición. */
export function calcularRanking(partida: Partida, totales: Record<string, number> = totalesPartida(partida)): FilaRanking[] {
  const filas = partida.participantes
    .map((participante, indice) => ({ participante, puntos: totales[participante.id] ?? 0, indice }))
    .sort((a, b) => b.puntos - a.puntos || a.indice - b.indice);

  let posicionActual = 0;
  let puntosAnteriores: number | null = null;
  return filas.map((fila, indice) => {
    if (puntosAnteriores === null || fila.puntos !== puntosAnteriores) posicionActual = indice + 1;
    puntosAnteriores = fila.puntos;
    return { participante: fila.participante, puntos: fila.puntos, posicion: posicionActual };
  });
}

export function objetivoAlcanzado(objetivo: number | null, totales: Record<string, number>): boolean {
  if (objetivo === null) return false;
  return Object.values(totales).some((puntos) => puntos >= objetivo);
}

export function quienMezclaYReparte(partida: Pick<Partida, 'ordenMesa'>, numeroRonda: number): { mezcla: string; reparte: string } {
  const asientos = partida.ordenMesa;
  const total = asientos.length || 1;
  const base = Math.max(0, numeroRonda - 1);
  return {
    mezcla: asientos[base % total] ?? '—',
    reparte: asientos[(base + 1) % total] ?? '—',
  };
}

/** Nombre de un equipo armado con sus integrantes: "Franco y Sol". */
export function nombreEquipo(integrantes: string[]): string {
  return integrantes.join(' y ');
}

/** Solo las partidas viejas (con nombres como "Equipo 1") necesitan mostrar a los integrantes aparte. */
export function subtituloParticipante(participante: Participante): string {
  if (participante.jugadoresIds.length <= 1) return '';
  if (participante.nombre === nombreEquipo(participante.jugadoresNombres)) return '';
  return participante.jugadoresNombres.join(' + ');
}

export function nombreCompletoParticipante(participante: Participante): string {
  const subtitulo = subtituloParticipante(participante);
  return subtitulo ? `${participante.nombre} (${subtitulo})` : participante.nombre;
}

export function ordenarPartidas(partidas: Partida[]): Partida[] {
  return [...partidas].sort((a, b) => b.actualizada.localeCompare(a.actualizada));
}

/** Descarta las finalizadas más viejas si se supera el máximo (las en curso nunca se descartan). */
export function recortarPartidas(partidas: Partida[]): Partida[] {
  const finalizadas = ordenarPartidas(partidas.filter((partida) => partida.estado === 'finalizada'));
  if (finalizadas.length <= MAX_PARTIDAS_FINALIZADAS) return partidas;
  const sobrantes = new Set(finalizadas.slice(MAX_PARTIDAS_FINALIZADAS).map((partida) => partida.id));
  return partidas.filter((partida) => !sobrantes.has(partida.id));
}

export function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
