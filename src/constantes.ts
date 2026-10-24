// ════════════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN DEL JUEGO — editá acá los valores si querés ajustar reglas
// ════════════════════════════════════════════════════════════════════════

/**
 * Puntaje mínimo que hay que bajar en la primera apertura (abrirse / levantar el pozo).
 * Se calcula según el puntaje ACUMULADO al inicio de la ronda:
 *
 *   puntos < umbrales[0]                    → requisitos[0]   (por defecto: negativo (menos de 0)  → 15)
 *   umbrales[0] ≤ puntos < umbrales[1]      → requisitos[1]   (por defecto: de 0 a 2.499          → 50)
 *   umbrales[1] ≤ puntos < umbrales[2]      → requisitos[2]   (por defecto: de 2.500 a 4.999      → 90)
 *   puntos ≥ umbrales[2]                    → requisitos[3]   (por defecto: 5.000 o más           → 120)
 *
 * `requisitos` siempre debe tener un elemento más que `umbrales`.
 */
export const CONFIG_APERTURA = {
  umbrales: [0, 2500, 5000],
  requisitos: [15, 50, 90, 120],
} as const;

/** Valores de puntuación de cada ronda. Todo lo que suma o resta puntos vive acá. */
export const CONFIG_PUNTAJE = {
  bonoCorteExacto: 100,
  bonoCierre: 100,
  /** "Espejito": en el pozo está dada vuelta la misma carta que se tiene en la mano al repartir. */
  bonoEspejito: 100,
  /** Índice = cantidad de Tres Rojos (0 a 5). */
  tresRojos: [0, 100, 200, 300, 500, 1000],
  /** Cada Tres Rojo a partir del sexto (solo posible con 4 mazos o más) suma esto además de los +1000 de los primeros 5. */
  tresRojoExtra: 100,
  canastaEstandar: { pura: 500, impura: 300 },
  canastaAses: { pura: 1000, impura: 500 },
  canastaComodines: 2000,
  /** Valor por carta (a favor si está en la mesa, en contra si quedó en la mano). */
  valorCarta: { c5: 5, c10: 10, c20: 20, c50: 50 },
  penalidadTresNegro: 100,
  /** Premios fijos de las partidas viejas (las nuevas usan el premio configurable). */
  premioCanastron: { cantidad: 5, puntos: 500 },
  premioCanastaDeCanastas: { cantidad: 7, puntos: 2000 },
} as const;

/** Premio por cantidad de canastas sugerido al crear la partida (arranca desactivado). */
export const PREMIO_CANASTAS_DEFECTO = { activo: false, cantidad: 5, puntos: 500 } as const;

/** Puntaje para ganar sugerido al crear la partida (se escribe a mano; vacío = sin límite). */
export const PUNTAJE_OBJETIVO_DEFECTO: number | null = 15000;

/** Cantidad de mazos sugerida al crear la partida (siempre par). */
export const MAZOS_DEFECTO = 4;
export const MAZOS_MIN = 2;
export const MAZOS_MAX = 12;

// ── Jugadores y equipos ─────────────────────────────────────────────────
export const MIN_JUGADORES_INDIVIDUAL = 2;
export const JUGADORES_POR_EQUIPO = 2;
export const MIN_EQUIPOS = 2;

// ── Límites físicos del mazo ────────────────────────────────────────────
/**
 * Cada "mazo" es de 52 cartas + 2 Jokers. Los máximos de cada contador escalan con la cantidad de mazos (N):
 * con 2 mazos (el valor clásico) dan 4 / 4 / 32 / 48 / 16 / 4.
 */
export const LIMITES_POR_MAZO = {
  tresRojos: 2,
  tresNegros: 2,
  c5: 16, // 4, 5, 6, 7 → 4 números × 4 cartas
  c10: 24, // 8, 9, 10, J, Q, K → 6 números × 4 cartas
  c20: 8, // 4 Ases + 4 de los dos
  c50: 2, // 2 Jokers
} as const;

export type LimitesMazo = { [clave in keyof typeof LIMITES_POR_MAZO]: number };

export function limitesMazo(mazos: number): LimitesMazo {
  const n = Math.max(1, Math.trunc(mazos));
  return {
    tresRojos: LIMITES_POR_MAZO.tresRojos * n,
    tresNegros: LIMITES_POR_MAZO.tresNegros * n,
    c5: LIMITES_POR_MAZO.c5 * n,
    c10: LIMITES_POR_MAZO.c10 * n,
    c20: LIMITES_POR_MAZO.c20 * n,
    c50: LIMITES_POR_MAZO.c50 * n,
  };
}

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
