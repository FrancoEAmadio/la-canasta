import { LIMITES_MAZO } from '../constantes.ts';
import type { EntradaRonda, FiguraCanasta, Participante } from '../tipos/index.ts';
import { FIGURAS_CANASTA } from './puntuacion.ts';

type ClaveCarta = 'c5' | 'c10' | 'c20' | 'c50';

function sumarEntradas(entradas: Record<string, EntradaRonda>, extraer: (entrada: EntradaRonda) => number): number {
  return Object.values(entradas).reduce((total, entrada) => total + extraer(entrada), 0);
}

/**
 * Máximo de cartas que puede cargar un jugador/equipo en un contador, respetando
 * que el mazo es físico: 2 mazos + 4 Jokers (nadie puede "inventar" cartas).
 * Se cuentan juntas las cartas de la mesa y de la mano de todos los participantes.
 */
export function maxCartas(
  entradas: Record<string, EntradaRonda>,
  participanteId: string,
  zona: 'mesa' | 'mano',
  clave: ClaveCarta
): number {
  const usadasEnTotal = sumarEntradas(entradas, (entrada) => entrada.cartasMesa[clave] + entrada.cartasMano[clave]);
  const actual = entradas[participanteId]?.[zona === 'mesa' ? 'cartasMesa' : 'cartasMano'][clave] ?? 0;
  return Math.max(0, LIMITES_MAZO[clave] - (usadasEnTotal - actual));
}

export function maxTresRojos(entradas: Record<string, EntradaRonda>, participanteId: string): number {
  const usados = sumarEntradas(entradas, (entrada) => entrada.tresRojos);
  const actual = entradas[participanteId]?.tresRojos ?? 0;
  return Math.max(0, LIMITES_MAZO.tresRojos - (usados - actual));
}

export function maxTresNegros(entradas: Record<string, EntradaRonda>, participanteId: string): number {
  const usados = sumarEntradas(entradas, (entrada) => entrada.cartasMano.tresNegros);
  const actual = entradas[participanteId]?.cartasMano.tresNegros ?? 0;
  return Math.max(0, LIMITES_MAZO.tresNegros - (usados - actual));
}

function tieneAlgunaCanasta(entrada: EntradaRonda): boolean {
  return entrada.canastaComodines || FIGURAS_CANASTA.some((figura) => entrada.canastas[figura] !== 'ninguna');
}

/**
 * Avisos NO bloqueantes: situaciones que casi seguro son un error de carga
 * (o que contradicen las reglas), pero que dejamos corregir al usuario.
 */
export function advertenciasRonda(participantes: Participante[], entradas: Record<string, EntradaRonda>): string[] {
  const avisos: string[] = [];

  for (const participante of participantes) {
    const entrada = entradas[participante.id];
    if (entrada?.cerro && !tieneAlgunaCanasta(entrada)) {
      avisos.push(`${participante.nombre} figura como quien cerró la ronda, pero no tiene ninguna canasta (para cerrar hace falta al menos una).`);
    }
  }

  for (const figura of FIGURAS_CANASTA) {
    const conCanasta = participantes.filter((participante) => entradas[participante.id]?.canastas[figura as FiguraCanasta] !== 'ninguna');
    const hayPura = conCanasta.some((participante) => entradas[participante.id]?.canastas[figura] === 'pura');
    const nombreFigura = figura === 'A' ? 'Ases' : figura;
    if (conCanasta.length >= 2 && hayPura) {
      avisos.push(`Canasta de ${nombreFigura}: una canasta pura usa 7 u 8 de las 8 cartas, así que otro jugador/equipo no puede tener también una canasta de ${nombreFigura}.`);
    } else if (conCanasta.length >= 3) {
      avisos.push(`Canasta de ${nombreFigura}: tres canastas del mismo número no entran en 8 cartas.`);
    }
  }

  const conComodines = participantes.filter((participante) => entradas[participante.id]?.canastaComodines);
  if (conComodines.length >= 2) {
    avisos.push('Canasta de Comodines: hay 12 comodines en total (8 doses + 4 Jokers), así que solo un jugador/equipo puede tener esa canasta.');
  }

  return avisos;
}
