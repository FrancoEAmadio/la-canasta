// ════════════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN DEL JUEGO — editá acá los valores si querés ajustar reglas
// ════════════════════════════════════════════════════════════════════════

/**
 * Puntaje mínimo que hay que bajar en la primera apertura (abrirse / levantar el pozo).
 * Se calcula según el puntaje ACUMULADO al inicio de la ronda:
 *
 *   puntos < umbrales[0]                    → requisitos[0]   (por defecto: menos de 500  → 50)
 *   umbrales[0] ≤ puntos < umbrales[1]      → requisitos[1]   (por defecto: 500 a 999     → 90)
 *   puntos ≥ umbrales[1]                    → requisitos[2]   (por defecto: 1000 o más    → 120)
 *
 * `requisitos` siempre debe tener un elemento más que `umbrales`.
 */
export const CONFIG_APERTURA = {
  umbrales: [500, 1000],
  requisitos: [50, 90, 120],
} as const;

/** Valores de puntuación de cada ronda. Todo lo que suma o resta puntos vive acá. */
export const CONFIG_PUNTAJE = {
  bonoCorteExacto: 100,
  bonoCierre: 100,
  /** Índice = cantidad de Tres Rojos (0 a 4). */
  tresRojos: [0, 100, 200, 300, 500],
  canastaEstandar: { pura: 500, impura: 300 },
  canastaAses: { pura: 1000, impura: 500 },
  canastaComodines: 2000,
  /** Valor por carta (a favor si está en la mesa, en contra si quedó en la mano). */
  valorCarta: { c5: 5, c10: 10, c20: 20, c50: 50 },
  penalidadTresNegro: 100,
  /** Premios opcionales por cantidad de canastas en una misma ronda (se activan al crear la partida). */
  premioCanastron: { cantidad: 5, puntos: 500 },
  premioCanastaDeCanastas: { cantidad: 7, puntos: 2000 },
} as const;

/** Puntaje para ganar la partida por defecto (null = sin límite). Se puede cambiar al crear la partida. */
export const PUNTAJE_OBJETIVO_DEFECTO: number | null = 5000;
export const OPCIONES_OBJETIVO: (number | null)[] = [3000, 5000, 7500, 10000, null];

// ── Jugadores y equipos ─────────────────────────────────────────────────
export const MIN_JUGADORES_INDIVIDUAL = 2;
export const MAX_JUGADORES_INDIVIDUAL = 6;
export const JUGADORES_POR_EQUIPO = 2;
export const MIN_EQUIPOS = 2;
export const MAX_EQUIPOS = 3;

// ── Límites físicos del mazo (2 mazos ingleses + 4 Jokers = 108 cartas) ──
export const LIMITES_MAZO = {
  tresRojos: 4,
  tresNegros: 4,
  c5: 32, // 4, 5, 6, 7 → 4 números × 8 cartas
  c10: 48, // 8, 9, 10, J, Q, K → 6 números × 8 cartas
  c20: 16, // 8 Ases + 8 doses
  c50: 4, // 4 Jokers
} as const;

// ── Persistencia (localStorage) ─────────────────────────────────────────
export const MAX_PARTIDAS_FINALIZADAS = 150;
export const MAX_PARTIDAS_EVOLUCION = 20;
export const VERSION_ESQUEMA = 1;

export const CLAVE_LS_JUGADORES = 'lacanasta_jugadores';
export const CLAVE_LS_PARTIDAS_EN_CURSO = 'lacanasta_partidas_en_curso';
export const CLAVE_LS_PARTIDAS_FINALIZADAS = 'lacanasta_partidas_finalizadas';
export const CLAVE_LS_AJUSTES = 'lacanasta_ajustes';
export const CLAVE_LS_VERSION = 'lacanasta_version';

// ── Gestos ──────────────────────────────────────────────────────────────
export const UMBRAL_SWIPE_PX = 45;
export const RATIO_PREDOMINIO_HORIZONTAL = 1.35;

export const TEXTO_FOOTER = 'Desarrollado por Franco Ezequiel Amadio';
