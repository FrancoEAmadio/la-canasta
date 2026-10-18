export type PantallaId = 'inicio' | 'nueva_partida' | 'partida' | 'jugadores' | 'reglas';

export type PasoPartida = 'mesa' | 'puntos' | 'resumen';

export type ModoJuego = 'individual' | 'parejas';

export type Palo = 'picas' | 'corazones' | 'diamantes' | 'treboles';

export type TipoCanasta = 'ninguna' | 'pura' | 'impura';

/** Figuras con canasta estándar (pura 500 / impura 300). */
export type FiguraEstandar = '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

/** Figuras que admiten canasta pura/impura (las estándar + los Ases). */
export type FiguraCanasta = FiguraEstandar | 'A';

export interface CartasMesa {
  c5: number;
  c10: number;
  c20: number;
  c50: number;
}

export interface CartasMano extends CartasMesa {
  tresNegros: number;
}

/** Todo lo que se carga para UN jugador/equipo al terminar UNA ronda. */
export interface EntradaRonda {
  corteExacto: boolean;
  cerro: boolean;
  tresRojos: number;
  canastas: Record<FiguraCanasta, TipoCanasta>;
  canastaComodines: boolean;
  cartasMesa: CartasMesa;
  cartasMano: CartasMano;
}

export interface ReglasPartida {
  /** Premios opcionales: Canastrón (5 canastas) y Canasta de canastas (7). */
  premiosPorCantidad: boolean;
}

export interface LineaDesglose {
  etiqueta: string;
  cantidad?: number;
  puntos: number;
}

export interface DesgloseRonda {
  bonos: LineaDesglose[];
  canastas: LineaDesglose[];
  cartas: LineaDesglose[];
  penalizaciones: LineaDesglose[];
  subtotalBonos: number;
  subtotalCanastas: number;
  subtotalCartas: number;
  /** Siempre ≤ 0. */
  subtotalPenalizaciones: number;
  total: number;
  conteo: { puras: number; impuras: number; comodines: number };
}

export interface Ronda {
  numero: number;
  entradas: Record<string, EntradaRonda>;
}

/** Un jugador (modo individual) o un equipo de 2 (modo parejas). */
export interface Participante {
  id: string;
  nombre: string;
  jugadoresIds: string[];
  jugadoresNombres: string[];
}

export interface BorradorRonda {
  numero: number;
  entradas: Record<string, EntradaRonda>;
  paso: PasoPartida;
  seleccionIdx: number;
  /** Índice (en `rondas`) de la ronda que se está corrigiendo, o null si es una ronda nueva. */
  editandoIdx: number | null;
}

export type EstadoPartida = 'en_curso' | 'finalizada';

export interface Partida {
  id: string;
  creada: string;
  actualizada: string;
  finalizadaEn: string | null;
  estado: EstadoPartida;
  modo: ModoJuego;
  /** null = sin límite de puntos. */
  objetivo: number | null;
  reglas: ReglasPartida;
  participantes: Participante[];
  /** Nombres de los jugadores en el orden en que están sentados (para rotar quién reparte). */
  ordenMesa: string[];
  rondas: Ronda[];
  borrador: BorradorRonda;
}

export interface FilaRanking {
  participante: Participante;
  puntos: number;
  posicion: number;
}

// ── Jugadores permanentes (tarjetas) ────────────────────────────────────
export interface ResumenModo {
  jugadas: number;
  victorias: number;
}

export interface EstadisticasJugador {
  partidasJugadas: number;
  victorias: number;
  sumaPuntos: number;
  mejorPartida: number | null;
  canastasPuras: number;
  canastasImpuras: number;
  canastasComodines: number;
  tresRojos: number;
  cierres: number;
  cortesExactos: number;
  porModo: Record<ModoJuego, ResumenModo>;
}

export interface EntradaEvolucion {
  fecha: string;
  puntos: number;
  posicion: number;
  modo: ModoJuego;
}

export interface JugadorPermanente {
  id: string;
  nombre: string;
  palo: Palo;
  estadisticas: EstadisticasJugador;
  evolucion: EntradaEvolucion[];
}

// ── Ajustes ─────────────────────────────────────────────────────────────
export interface Ajustes {
  mantenerPantallaEncendida: boolean;
  vibracion: boolean;
}

// ── Catálogo y reglas (wiki) ────────────────────────────────────────────
export interface CartaCatalogo {
  rango: string;
  palo?: Palo;
  joker?: 'rojo' | 'negro';
}

export interface GrupoCatalogo {
  id: string;
  titulo: string;
  cartas: CartaCatalogo[];
  nota?: string;
  valorIndividual: string;
  valorCanasta?: string;
  funcion: string;
  palabrasClave: string[];
}

export interface ReglaItem {
  titulo: string;
  texto: string;
}

export interface CategoriaRegla {
  id: string;
  titulo: string;
  items: ReglaItem[];
}
