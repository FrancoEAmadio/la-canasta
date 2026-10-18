import { CONFIG_PUNTAJE } from '../constantes.ts';
import type {
  CartasMesa,
  DesgloseRonda,
  EntradaRonda,
  FiguraCanasta,
  FiguraEstandar,
  LineaDesglose,
  ReglasPartida,
  TipoCanasta,
} from '../tipos/index.ts';

export const FIGURAS_ESTANDAR: readonly FiguraEstandar[] = ['4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const FIGURAS_CANASTA: readonly FiguraCanasta[] = ['A', ...FIGURAS_ESTANDAR];

export function crearCanastasVacias(): Record<FiguraCanasta, TipoCanasta> {
  const canastas = {} as Record<FiguraCanasta, TipoCanasta>;
  for (const figura of FIGURAS_CANASTA) canastas[figura] = 'ninguna';
  return canastas;
}

export function crearEntradaVacia(): EntradaRonda {
  return {
    corteExacto: false,
    cerro: false,
    tresRojos: 0,
    canastas: crearCanastasVacias(),
    canastaComodines: false,
    cartasMesa: { c5: 0, c10: 0, c20: 0, c50: 0 },
    cartasMano: { tresNegros: 0, c5: 0, c10: 0, c20: 0, c50: 0 },
  };
}

export function clonarEntrada(entrada: EntradaRonda): EntradaRonda {
  return {
    ...entrada,
    canastas: { ...entrada.canastas },
    cartasMesa: { ...entrada.cartasMesa },
    cartasMano: { ...entrada.cartasMano },
  };
}

export function valorCanasta(figura: FiguraCanasta, tipo: TipoCanasta): number {
  if (tipo === 'ninguna') return 0;
  const tabla = figura === 'A' ? CONFIG_PUNTAJE.canastaAses : CONFIG_PUNTAJE.canastaEstandar;
  return tabla[tipo];
}

const ETIQUETAS_MESA: { clave: keyof CartasMesa; etiqueta: string }[] = [
  { clave: 'c5', etiqueta: 'Cartas de 5 (4 al 7)' },
  { clave: 'c10', etiqueta: 'Cartas de 10 (8 al K)' },
  { clave: 'c20', etiqueta: 'Cartas de 20 (A y 2)' },
  { clave: 'c50', etiqueta: 'Jokers' },
];

const ETIQUETAS_MANO: { clave: keyof CartasMesa; etiqueta: string }[] = [
  { clave: 'c5', etiqueta: 'En mano: cartas de 5' },
  { clave: 'c10', etiqueta: 'En mano: cartas de 10' },
  { clave: 'c20', etiqueta: 'En mano: A y 2' },
  { clave: 'c50', etiqueta: 'En mano: Jokers' },
];

function sumar(lineas: LineaDesglose[]): number {
  return lineas.reduce((acumulado, linea) => acumulado + linea.puntos, 0);
}

export function puntosTresRojos(cantidad: number): number {
  const indice = Math.max(0, Math.min(CONFIG_PUNTAJE.tresRojos.length - 1, Math.trunc(cantidad)));
  return CONFIG_PUNTAJE.tresRojos[indice]!;
}

/**
 * Calcula el puntaje de UNA ronda para UN jugador/equipo.
 * Resumen = Canastas + Cartas + Bonos − Penalizaciones.
 */
export function calcularEntrada(
  entrada: EntradaRonda,
  reglas: ReglasPartida = { premiosPorCantidad: false }
): DesgloseRonda {
  const bonos: LineaDesglose[] = [];
  const canastas: LineaDesglose[] = [];
  const cartas: LineaDesglose[] = [];
  const penalizaciones: LineaDesglose[] = [];

  // ── Bloque 1: bonificaciones ──
  if (entrada.corteExacto) {
    bonos.push({ etiqueta: 'Corte exacto en el reparto', puntos: CONFIG_PUNTAJE.bonoCorteExacto });
  }
  if (entrada.cerro) {
    bonos.push({ etiqueta: 'Cerró / cortó la ronda', puntos: CONFIG_PUNTAJE.bonoCierre });
  }
  if (entrada.tresRojos > 0) {
    bonos.push({
      etiqueta: entrada.tresRojos === 4 ? 'Los 4 Tres Rojos' : 'Tres Rojos',
      cantidad: entrada.tresRojos,
      puntos: puntosTresRojos(entrada.tresRojos),
    });
  }

  // ── Bloque 2: canastas ──
  let puras = 0;
  let impuras = 0;
  for (const figura of FIGURAS_CANASTA) {
    const tipo = entrada.canastas[figura];
    if (tipo === 'ninguna') continue;
    if (tipo === 'pura') puras += 1;
    else impuras += 1;
    canastas.push({
      etiqueta: `Canasta ${tipo} de ${figura === 'A' ? 'Ases' : figura}`,
      puntos: valorCanasta(figura, tipo),
    });
  }
  let comodines = 0;
  if (entrada.canastaComodines) {
    comodines = 1;
    canastas.push({ etiqueta: 'Canasta de Comodines', puntos: CONFIG_PUNTAJE.canastaComodines });
  }

  // Premios opcionales por cantidad de canastas
  if (reglas.premiosPorCantidad) {
    const total = puras + impuras + comodines;
    const { premioCanastaDeCanastas, premioCanastron } = CONFIG_PUNTAJE;
    if (total >= premioCanastaDeCanastas.cantidad) {
      bonos.push({ etiqueta: `Canasta de canastas (${premioCanastaDeCanastas.cantidad}+)`, puntos: premioCanastaDeCanastas.puntos });
    } else if (total >= premioCanastron.cantidad) {
      bonos.push({ etiqueta: `Canastrón (${premioCanastron.cantidad}+)`, puntos: premioCanastron.puntos });
    }
  }

  // ── Bloque 3: cartas bajadas en la mesa ──
  for (const { clave, etiqueta } of ETIQUETAS_MESA) {
    const cantidad = entrada.cartasMesa[clave];
    if (cantidad > 0) {
      cartas.push({ etiqueta, cantidad, puntos: cantidad * CONFIG_PUNTAJE.valorCarta[clave] });
    }
  }

  // ── Bloque 4: cartas que quedaron en la mano (restan) ──
  const mano = entrada.cartasMano;
  if (mano.tresNegros > 0) {
    penalizaciones.push({
      etiqueta: 'Tres Negros en mano',
      cantidad: mano.tresNegros,
      puntos: -mano.tresNegros * CONFIG_PUNTAJE.penalidadTresNegro,
    });
  }
  for (const { clave, etiqueta } of ETIQUETAS_MANO) {
    const cantidad = mano[clave];
    if (cantidad > 0) {
      penalizaciones.push({ etiqueta, cantidad, puntos: -cantidad * CONFIG_PUNTAJE.valorCarta[clave] });
    }
  }

  const subtotalBonos = sumar(bonos);
  const subtotalCanastas = sumar(canastas);
  const subtotalCartas = sumar(cartas);
  const subtotalPenalizaciones = sumar(penalizaciones);

  return {
    bonos,
    canastas,
    cartas,
    penalizaciones,
    subtotalBonos,
    subtotalCanastas,
    subtotalCartas,
    subtotalPenalizaciones,
    total: subtotalBonos + subtotalCanastas + subtotalCartas + subtotalPenalizaciones,
    conteo: { puras, impuras, comodines },
  };
}

/** Subtotales por bloque (para mostrar en vivo en cada panel). */
export function subtotalBloque1(entrada: EntradaRonda): number {
  return (
    (entrada.corteExacto ? CONFIG_PUNTAJE.bonoCorteExacto : 0) +
    (entrada.cerro ? CONFIG_PUNTAJE.bonoCierre : 0) +
    puntosTresRojos(entrada.tresRojos)
  );
}

export function subtotalBloque2(entrada: EntradaRonda): number {
  let total = entrada.canastaComodines ? CONFIG_PUNTAJE.canastaComodines : 0;
  for (const figura of FIGURAS_CANASTA) total += valorCanasta(figura, entrada.canastas[figura]);
  return total;
}

export function subtotalBloque3(entrada: EntradaRonda): number {
  const { c5, c10, c20, c50 } = entrada.cartasMesa;
  const v = CONFIG_PUNTAJE.valorCarta;
  return c5 * v.c5 + c10 * v.c10 + c20 * v.c20 + c50 * v.c50;
}

export function subtotalBloque4(entrada: EntradaRonda): number {
  const { tresNegros, c5, c10, c20, c50 } = entrada.cartasMano;
  const v = CONFIG_PUNTAJE.valorCarta;
  return -(tresNegros * CONFIG_PUNTAJE.penalidadTresNegro + c5 * v.c5 + c10 * v.c10 + c20 * v.c20 + c50 * v.c50);
}

export function formatearPuntos(valor: number, conSigno = false): string {
  const texto = Math.abs(valor).toLocaleString('es-AR');
  if (valor < 0) return `−${texto}`;
  return conSigno && valor > 0 ? `+${texto}` : texto;
}
