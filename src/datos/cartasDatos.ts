import { CONFIG_PUNTAJE } from '../constantes';
import type { GrupoCatalogo } from '../tipos';

const pts = (valor: number) => valor.toLocaleString('es-AR');
const { canastaEstandar, canastaAses, canastaComodines, valorCarta, tresRojos, penalidadTresNegro } = CONFIG_PUNTAJE;

export const CATALOGO_CARTAS: GrupoCatalogo[] = [
  {
    id: 'cinco',
    titulo: 'Cartas de 5 puntos',
    cartas: [
      { rango: '4', palo: 'picas' },
      { rango: '5', palo: 'corazones' },
      { rango: '6', palo: 'treboles' },
      { rango: '7', palo: 'diamantes' },
    ],
    valorIndividual: `${valorCarta.c5} puntos cada carta (a favor si la bajás a la mesa, en contra si te queda en la mano).`,
    valorCanasta: `Pura ${pts(canastaEstandar.pura)} pts  |  Impura ${pts(canastaEstandar.impura)} pts`,
    funcion: 'Cartas bajas: forman canastas estándar (4, 5, 6 y 7). Cada una vale lo mismo en los cuatro palos.',
    palabrasClave: ['4', '5', '6', '7', 'cuatro', 'cinco', 'seis', 'siete', 'bajas', '5 puntos', 'canasta estandar'],
  },
  {
    id: 'diez',
    titulo: 'Cartas de 10 puntos',
    cartas: [
      { rango: '8', palo: 'corazones' },
      { rango: '9', palo: 'picas' },
      { rango: '10', palo: 'diamantes' },
      { rango: 'J', palo: 'treboles' },
      { rango: 'Q', palo: 'corazones' },
      { rango: 'K', palo: 'picas' },
    ],
    nota: 'No existen el 11 ni el 12: en su lugar están la J y la Q.',
    valorIndividual: `${valorCarta.c10} puntos cada carta.`,
    valorCanasta: `Pura ${pts(canastaEstandar.pura)} pts  |  Impura ${pts(canastaEstandar.impura)} pts`,
    funcion: 'Cartas altas: forman canastas estándar (8, 9, 10, J, Q y K).',
    palabrasClave: ['8', '9', '10', 'j', 'q', 'k', 'jota', 'sota', 'reina', 'rey', 'figuras', 'ocho', 'nueve', 'diez', '10 puntos', 'canasta estandar'],
  },
  {
    id: 'ases',
    titulo: 'Los Ases',
    cartas: [
      { rango: 'A', palo: 'picas' },
      { rango: 'A', palo: 'corazones' },
      { rango: 'A', palo: 'diamantes' },
      { rango: 'A', palo: 'treboles' },
    ],
    valorIndividual: `${valorCarta.c20} puntos cada As.`,
    valorCanasta: `Canasta de Ases: Pura ${pts(canastaAses.pura)} pts  |  Impura ${pts(canastaAses.impura)} pts`,
    funcion: 'Tienen su propia canasta, que paga el doble que una estándar. Máximo 1 canasta de Ases por equipo.',
    palabrasClave: ['a', 'as', 'ases', 'uno', '20 puntos', '1000', 'canasta de ases'],
  },
  {
    id: 'comodines',
    titulo: 'Los Comodines',
    cartas: [
      { rango: '2', palo: 'picas' },
      { rango: '2', palo: 'corazones' },
      { rango: 'JOKER', joker: 'negro' },
      { rango: 'JOKER', joker: 'rojo' },
    ],
    valorIndividual: `Cada 2 vale ${valorCarta.c20} puntos; cada Joker vale ${valorCarta.c50} puntos.`,
    valorCanasta: `Canasta de Comodines: ${pts(canastaComodines)} pts (no existe versión impura)`,
    funcion: 'Reemplazan a otras cartas para armar canastas impuras. Si juntás 7 o más comodines (2 y Jokers) hacés la Canasta de Comodines.',
    palabrasClave: ['2', 'dos', 'joker', 'jokers', 'comodin', 'comodines', 'wild', '50 puntos', '2000', 'impura', 'canasta de comodines'],
  },
  {
    id: 'rojos',
    titulo: 'Los Tres Rojos',
    cartas: [
      { rango: '3', palo: 'corazones' },
      { rango: '3', palo: 'diamantes' },
    ],
    valorIndividual: `Bonificación: +${tresRojos[1]} puntos cada uno. Con 2: +${tresRojos[2]}, con 3: +${tresRojos[3]}, con 4: +${tresRojos[4]} y con 5: +${tresRojos[5].toLocaleString('es-AR')}. Con más de 5 (4 mazos o más): +${tresRojos[5].toLocaleString('es-AR')} más +${CONFIG_PUNTAJE.tresRojoExtra} por cada uno adicional.`,
    funcion: 'Cartas de bonificación, no sirven para formar canastas. Se bajan apenas se levantan y se reemplazan robando otra carta del mazo.',
    palabrasClave: ['3', 'tres', 'rojo', 'rojos', 'tres rojos', 'bonificacion', 'bonus', 'honores', '100', '500', '1000', 'corazones', 'diamantes'],
  },
  {
    id: 'negros',
    titulo: 'Los Tres Negros',
    cartas: [
      { rango: '3', palo: 'picas' },
      { rango: '3', palo: 'treboles' },
    ],
    valorIndividual: `No suman puntos a favor. Si al terminar la ronda te quedás con uno en la mano: −${penalidadTresNegro} puntos cada uno.`,
    funcion: 'Sirven para tapar / congelar el pozo: al descartarlos, el siguiente jugador no puede levantarlo (el efecto dura un turno).',
    palabrasClave: ['3', 'tres', 'negro', 'negros', 'tres negros', 'tapar', 'congelar', 'pozo', 'penalidad', 'sancion', 'picas', 'treboles'],
  },
];
