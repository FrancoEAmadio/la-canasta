import { limitesMazo } from '../constantes.ts';
import type { EntradaRonda, FiguraCanasta, Participante } from '../tipos/index.ts';
import { FIGURAS_CANASTA } from './puntuacion.ts';

type ClaveCarta = 'c5' | 'c10' | 'c20' | 'c50';

function sumarEntradas(entradas: Record<string, EntradaRonda>, extraer: (entrada: EntradaRonda) => number): number {
  return Object.values(entradas).reduce((total, entrada) => total + extraer(entrada), 0);
}

/**
 * Máximo de cartas que puede cargar un jugador/equipo en un contador, respetando
 * que el mazo es físico (nadie puede "inventar" cartas); escala con la cantidad de mazos.
 * Se cuentan juntas las cartas de la mesa y de la mano de todos los participantes.
 */
export function maxCartas(
  entradas: Record<string, EntradaRonda>,
  participanteId: string,
  zona: 'mesa' | 'mano',
  clave: ClaveCarta,
  mazos: number
): number {
  const usadasEnTotal = sumarEntradas(entradas, (entrada) => entrada.cartasMesa[clave] + entrada.cartasMano[clave]);
  const actual = entradas[participanteId]?.[zona === 'mesa' ? 'cartasMesa' : 'cartasMano'][clave] ?? 0;
  return Math.max(0, limitesMazo(mazos)[clave] - (usadasEnTotal - actual));
}

export function maxTresRojos(entradas: Record<string, EntradaRonda>, participanteId: string, mazos: number): number {
  const usados = sumarEntradas(entradas, (entrada) => entrada.tresRojos);
  const actual = entradas[participanteId]?.tresRojos ?? 0;
  return Math.max(0, limitesMazo(mazos).tresRojos - (usados - actual));
}

export function maxTresNegros(entradas: Record<string, EntradaRonda>, participanteId: string, mazos: number): number {
  const usados = sumarEntradas(entradas, (entrada) => entrada.cartasMano.tresNegros);
  const actual = entradas[participanteId]?.cartasMano.tresNegros ?? 0;
  return Math.max(0, limitesMazo(mazos).tresNegros - (usados - actual));
}

function tieneAlgunaCanasta(entrada: EntradaRonda): boolean {
  return entrada.canastaComodines || FIGURAS_CANASTA.some((figura) => entrada.canastas[figura] !== 'ninguna');
}

/**
 * Avisos NO bloqueantes: situaciones que casi seguro son un error de carga
 * (o que contradicen las reglas), pero que dejamos corregir al usuario.
 */
export function advertenciasRonda(
  participantes: Participante[],
  entradas: Record<string, EntradaRonda>,
  mazos: number
): string[] {
  const avisos: string[] = [];
  /** Cartas de una misma figura que existen en juego (4 por mazo). */
  const cartasPorFigura = 4 * mazos;
  /** Cartas naturales mínimas que necesita cada tipo de canasta (7 cartas; la impura admite hasta 3 comodines). */
  const naturalesNecesarias = { pura: 7, impura: 4 } as const;

  for (const participante of participantes) {
    const entrada = entradas[participante.id];
    if (entrada?.cerro && !tieneAlgunaCanasta(entrada)) {
      avisos.push(`${participante.nombre} figura como quien cerró la ronda, pero no tiene ninguna canasta (para cerrar hace falta al menos una).`);
    }
  }

  for (const figura of FIGURAS_CANASTA) {
    const nombreFigura = figura === 'A' ? 'Ases' : figura;
    const tipos = participantes
      .map((participante) => entradas[participante.id]?.canastas[figura as FiguraCanasta])
      .filter((tipo): tipo is 'pura' | 'impura' => tipo === 'pura' || tipo === 'impura');
    const necesarias = tipos.reduce((total, tipo) => total + naturalesNecesarias[tipo], 0);
    if (tipos.length >= 2 && necesarias > cartasPorFigura) {
      avisos.push(`Canasta de ${nombreFigura}: con ${mazos} mazos hay ${cartasPorFigura} cartas de cada número, y esas canastas necesitarían al menos ${necesarias} naturales.`);
    }
  }

  /** Comodines en juego: los 2 (4 por mazo) + los Jokers (2 por mazo). */
  const comodinesEnJuego = 6 * mazos;
  const conComodines = participantes.filter((participante) => entradas[participante.id]?.canastaComodines);
  if (conComodines.length * 7 > comodinesEnJuego) {
    avisos.push(`Canasta de Comodines: con ${mazos} mazos hay ${comodinesEnJuego} comodines en total (${4 * mazos} cartas 2 + ${2 * mazos} Jokers), y cada canasta lleva 7.`);
  }

  return avisos;
}
