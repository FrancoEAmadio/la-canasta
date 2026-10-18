import {
  CLAVE_LS_AJUSTES,
  CLAVE_LS_JUGADORES,
  CLAVE_LS_PARTIDAS_EN_CURSO,
  CLAVE_LS_PARTIDAS_FINALIZADAS,
  CLAVE_LS_VERSION,
  VERSION_ESQUEMA,
} from '../constantes.ts';
import { crearEstadisticasVacias } from '../dominio/estadisticas.ts';
import { PALOS } from '../dominio/estadisticas.ts';
import { crearEntradaVacia } from '../dominio/puntuacion.ts';
import type { Ajustes, EntradaRonda, JugadorPermanente, Partida } from '../tipos/index.ts';

export const AJUSTES_POR_DEFECTO: Ajustes = {
  mantenerPantallaEncendida: true,
  vibracion: true,
};

function leerJson<T>(clave: string): T | null {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : null;
  } catch {
    return null;
  }
}

/** Devuelve false si el navegador no dejó guardar (modo privado, cuota llena…). */
function escribirJson(clave: string, valor: unknown): boolean {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    localStorage.setItem(CLAVE_LS_VERSION, String(VERSION_ESQUEMA));
    return true;
  } catch {
    return false;
  }
}

// ── Jugadores permanentes ───────────────────────────────────────────────
function normalizarJugador(crudo: Partial<JugadorPermanente>): JugadorPermanente | null {
  if (!crudo || typeof crudo.id !== 'string' || typeof crudo.nombre !== 'string') return null;
  const vacias = crearEstadisticasVacias();
  const estadisticas = { ...vacias, ...(crudo.estadisticas ?? {}) };
  estadisticas.porModo = {
    individual: { ...vacias.porModo.individual, ...(crudo.estadisticas?.porModo?.individual ?? {}) },
    parejas: { ...vacias.porModo.parejas, ...(crudo.estadisticas?.porModo?.parejas ?? {}) },
  };
  return {
    id: crudo.id,
    nombre: crudo.nombre,
    palo: crudo.palo && PALOS.includes(crudo.palo) ? crudo.palo : 'picas',
    estadisticas,
    evolucion: Array.isArray(crudo.evolucion) ? crudo.evolucion : [],
  };
}

export function cargarJugadores(): JugadorPermanente[] {
  const lista = leerJson<Partial<JugadorPermanente>[]>(CLAVE_LS_JUGADORES);
  if (!Array.isArray(lista)) return [];
  return lista.map(normalizarJugador).filter((jugador): jugador is JugadorPermanente => jugador !== null);
}

export function guardarJugadores(lista: JugadorPermanente[]): boolean {
  return escribirJson(CLAVE_LS_JUGADORES, lista);
}

// ── Partidas (en curso y finalizadas) ───────────────────────────────────
// Las entradas de cada ronda se guardan en formato compacto (solo lo que no está en
// su valor por defecto) para que el historial ocupe poco espacio en localStorage.
type EntradaCompacta = Record<string, unknown>;

function compactarEntrada(entrada: EntradaRonda): EntradaCompacta {
  const compacta: EntradaCompacta = {};
  if (entrada.corteExacto) compacta.ce = 1;
  if (entrada.cerro) compacta.ci = 1;
  if (entrada.tresRojos) compacta.tr = entrada.tresRojos;
  const canastas = Object.entries(entrada.canastas).filter(([, tipo]) => tipo !== 'ninguna');
  if (canastas.length) compacta.ca = Object.fromEntries(canastas);
  if (entrada.canastaComodines) compacta.cc = 1;
  const mesa = Object.entries(entrada.cartasMesa).filter(([, valor]) => valor > 0);
  if (mesa.length) compacta.cm = Object.fromEntries(mesa);
  const mano = Object.entries(entrada.cartasMano).filter(([, valor]) => valor > 0);
  if (mano.length) compacta.cn = Object.fromEntries(mano);
  return compacta;
}

function hidratarEntrada(cruda: unknown): EntradaRonda {
  const base = crearEntradaVacia();
  if (!cruda || typeof cruda !== 'object') return base;
  const c = cruda as Record<string, unknown>;
  if ('canastas' in c && 'cartasMesa' in c) {
    // formato completo (copias de seguridad)
    const completa = c as unknown as EntradaRonda;
    return {
      ...base,
      ...completa,
      canastas: { ...base.canastas, ...completa.canastas },
      cartasMesa: { ...base.cartasMesa, ...completa.cartasMesa },
      cartasMano: { ...base.cartasMano, ...completa.cartasMano },
    };
  }
  return {
    corteExacto: c.ce === 1,
    cerro: c.ci === 1,
    tresRojos: typeof c.tr === 'number' ? c.tr : 0,
    canastas: { ...base.canastas, ...((c.ca as Partial<EntradaRonda['canastas']>) ?? {}) },
    canastaComodines: c.cc === 1,
    cartasMesa: { ...base.cartasMesa, ...((c.cm as Partial<EntradaRonda['cartasMesa']>) ?? {}) },
    cartasMano: { ...base.cartasMano, ...((c.cn as Partial<EntradaRonda['cartasMano']>) ?? {}) },
  };
}

function mapearEntradas(
  entradas: Record<string, unknown> | undefined,
  transformar: (entrada: never) => unknown
): Record<string, unknown> {
  return Object.fromEntries(Object.entries(entradas ?? {}).map(([id, entrada]) => [id, transformar(entrada as never)]));
}

function serializarPartida(partida: Partida): unknown {
  return {
    ...partida,
    rondas: partida.rondas.map((ronda) => ({ ...ronda, entradas: mapearEntradas(ronda.entradas, compactarEntrada) })),
    borrador: { ...partida.borrador, entradas: mapearEntradas(partida.borrador.entradas, compactarEntrada) },
  };
}

function esPartidaValida(crudo: unknown): crudo is Partida {
  if (!crudo || typeof crudo !== 'object') return false;
  const partida = crudo as Partial<Partida>;
  return (
    typeof partida.id === 'string' &&
    Array.isArray(partida.participantes) &&
    Array.isArray(partida.rondas) &&
    !!partida.borrador &&
    typeof partida.borrador === 'object' &&
    (partida.estado === 'en_curso' || partida.estado === 'finalizada')
  );
}

function hidratarPartida(partida: Partida): Partida {
  return {
    ...partida,
    reglas: { premiosPorCantidad: partida.reglas?.premiosPorCantidad ?? false },
    objetivo: partida.objetivo ?? null,
    finalizadaEn: partida.finalizadaEn ?? null,
    rondas: partida.rondas.map((ronda) => ({
      ...ronda,
      entradas: mapearEntradas(ronda.entradas, hidratarEntrada) as Record<string, EntradaRonda>,
    })),
    borrador: {
      ...partida.borrador,
      editandoIdx: partida.borrador.editandoIdx ?? null,
      seleccionIdx: partida.borrador.seleccionIdx ?? 0,
      entradas: mapearEntradas(partida.borrador.entradas, hidratarEntrada) as Record<string, EntradaRonda>,
    },
  };
}

export function cargarPartidas(): Partida[] {
  const enCurso = leerJson<unknown[]>(CLAVE_LS_PARTIDAS_EN_CURSO);
  const finalizadas = leerJson<unknown[]>(CLAVE_LS_PARTIDAS_FINALIZADAS);
  const lista = [...(Array.isArray(enCurso) ? enCurso : []), ...(Array.isArray(finalizadas) ? finalizadas : [])];
  return lista.filter(esPartidaValida).map(hidratarPartida);
}

let ultimasFinalizadasGuardadas: Partida[] | null = null;

function mismosElementos(a: Partida[], b: Partida[]): boolean {
  return a.length === b.length && a.every((partida, indice) => partida === b[indice]);
}

/**
 * Guarda las partidas. Las en curso se reescriben en cada cambio (son pocas y livianas);
 * las finalizadas solo cuando cambia esa lista, así cada toque no reescribe todo el historial.
 */
export function guardarPartidas(lista: Partida[]): boolean {
  const enCurso = lista.filter((partida) => partida.estado === 'en_curso');
  const finalizadas = lista.filter((partida) => partida.estado === 'finalizada');
  let correcto = escribirJson(CLAVE_LS_PARTIDAS_EN_CURSO, enCurso.map(serializarPartida));
  if (!ultimasFinalizadasGuardadas || !mismosElementos(ultimasFinalizadasGuardadas, finalizadas)) {
    correcto = escribirJson(CLAVE_LS_PARTIDAS_FINALIZADAS, finalizadas.map(serializarPartida)) && correcto;
    ultimasFinalizadasGuardadas = finalizadas;
  }
  return correcto;
}

// ── Ajustes ─────────────────────────────────────────────────────────────
export function cargarAjustes(): Ajustes {
  const guardados = leerJson<Partial<Ajustes>>(CLAVE_LS_AJUSTES);
  return {
    mantenerPantallaEncendida: guardados?.mantenerPantallaEncendida ?? AJUSTES_POR_DEFECTO.mantenerPantallaEncendida,
    vibracion: guardados?.vibracion ?? AJUSTES_POR_DEFECTO.vibracion,
  };
}

export function guardarAjustes(ajustes: Ajustes): boolean {
  return escribirJson(CLAVE_LS_AJUSTES, ajustes);
}

export function borrarTodosLosDatos(): void {
  ultimasFinalizadasGuardadas = null;
  try {
    localStorage.removeItem(CLAVE_LS_JUGADORES);
    localStorage.removeItem(CLAVE_LS_PARTIDAS_EN_CURSO);
    localStorage.removeItem(CLAVE_LS_PARTIDAS_FINALIZADAS);
    localStorage.removeItem(CLAVE_LS_AJUSTES);
    localStorage.removeItem(CLAVE_LS_VERSION);
  } catch {
    /* sin acceso a localStorage: no hay nada que borrar */
  }
}

// ── Copia de seguridad (exportar / importar) ────────────────────────────
export interface CopiaSeguridad {
  app: 'la-canasta';
  version: number;
  exportada: string;
  jugadores: JugadorPermanente[];
  partidas: Partida[];
  ajustes: Ajustes;
}

export function crearCopiaSeguridad(jugadores: JugadorPermanente[], partidas: Partida[], ajustes: Ajustes): CopiaSeguridad {
  return { app: 'la-canasta', version: VERSION_ESQUEMA, exportada: new Date().toISOString(), jugadores, partidas, ajustes };
}

export function interpretarCopiaSeguridad(texto: string): CopiaSeguridad | null {
  try {
    const crudo = JSON.parse(texto) as Partial<CopiaSeguridad>;
    if (crudo.app !== 'la-canasta' || !Array.isArray(crudo.jugadores) || !Array.isArray(crudo.partidas)) return null;
    const jugadores = crudo.jugadores
      .map((jugador) => normalizarJugador(jugador as Partial<JugadorPermanente>))
      .filter((jugador): jugador is JugadorPermanente => jugador !== null);
    const partidas = crudo.partidas.filter(esPartidaValida).map(hidratarPartida);
    return {
      app: 'la-canasta',
      version: crudo.version ?? VERSION_ESQUEMA,
      exportada: crudo.exportada ?? new Date().toISOString(),
      jugadores,
      partidas,
      ajustes: { ...AJUSTES_POR_DEFECTO, ...(crudo.ajustes ?? {}) },
    };
  } catch {
    return null;
  }
}
