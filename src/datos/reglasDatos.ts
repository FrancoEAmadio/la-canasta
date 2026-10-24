import { CONFIG_APERTURA, CONFIG_PUNTAJE, PUNTAJE_OBJETIVO_DEFECTO } from '../constantes';
import { tramosApertura } from '../dominio/apertura';
import type { CategoriaRegla } from '../tipos';

const pts = (valor: number) => valor.toLocaleString('es-AR');
const { canastaEstandar, canastaAses, canastaComodines, tresRojos, bonoCierre, bonoCorteExacto, penalidadTresNegro, bonoEspejito } = CONFIG_PUNTAJE;

const textoTramos = tramosApertura(CONFIG_APERTURA)
  .map((tramo) => {
    if (tramo.desde === null) return `• Menos de ${pts(tramo.hasta! + 1)} puntos acumulados → mínimo ${tramo.requisito} puntos.`;
    if (tramo.hasta === null) return `• ${pts(tramo.desde)} puntos o más → mínimo ${tramo.requisito} puntos.`;
    return `• De ${pts(tramo.desde)} a ${pts(tramo.hasta)} puntos acumulados → mínimo ${tramo.requisito} puntos.`;
  })
  .join('\n');

const textoObjetivo = PUNTAJE_OBJETIVO_DEFECTO === null ? 'sin límite' : `${pts(PUNTAJE_OBJETIVO_DEFECTO)} puntos`;

export const CATEGORIAS_REGLAS: CategoriaRegla[] = [
  {
    id: 'mazo',
    titulo: '1. El mazo y el reparto',
    items: [
      {
        titulo: '🃏 El mazo',
        texto:
          'COMPOSICIÓN\nSe juega con 2 mazos ingleses de póker completos (52 cartas cada uno, del As al Rey) más 4 Jokers: 108 cartas en total. Si en tu mesa se juega con más mazos, podés elegir la cantidad (siempre par) al crear la partida.\n\nLas figuras J y Q ocupan el lugar del 11 y el 12, así que no existen cartas con esos números.\n\nJUGADORES\nSe puede jugar de forma individual (todos contra todos, o mano a mano) o en parejas (equipos de 2 jugadores). No hay un máximo de jugadores ni de equipos: juegan todos los que se sienten a la mesa.',
      },
      {
        titulo: '✂️ Mezcla, corte y reparto',
        texto: `Un jugador mezcla y corta el mazo calculando la cantidad exacta de cartas que se van a repartir: 11 cartas por jugador más 11 cartas para el pozo. Otro jugador reparte.\n\nSi el corte del reparto resulta exacto —sin que sobren ni falten cartas— quien cortó suma un bono de +${bonoCorteExacto} puntos.\n\nEn la app, ese bono se marca con el interruptor "Corte exacto en el reparto". La app te muestra quién mezcla y quién reparte en cada ronda, rotando los asientos.`,
      },
    ],
  },
  {
    id: 'canastas',
    titulo: '2. Formación de juegos y canastas',
    items: [
      {
        titulo: '🧺 ¿Qué es una canasta?',
        texto:
          'Una canasta es un juego de mínimo 7 cartas del mismo número o letra. En Canasta no se arman escaleras: los juegos se forman con cartas iguales.\n\nEl objetivo de la ronda es bajar cartas a la mesa formando canastas y quedarse sin cartas en la mano antes que los demás.',
      },
      {
        titulo: '✨ Canasta pura e impura',
        texto: `• Canasta PURA: 7 o más cartas iguales, sin ningún comodín.\n• Canasta IMPURA: tiene al menos un comodín (un 2 o un Joker) reemplazando a una carta.\n\nVALORES\n• Canastas estándar (4, 5, 6, 7, 8, 9, 10, J, Q, K): pura ${pts(canastaEstandar.pura)} | impura ${pts(canastaEstandar.impura)}.\n• Canasta de Ases: pura ${pts(canastaAses.pura)} | impura ${pts(canastaAses.impura)}.\n• Canasta de Comodines (2 y Jokers): ${pts(canastaComodines)}, no existe versión impura.`,
      },
      {
        titulo: '☝️ Una sola canasta por número',
        texto:
          'Cada jugador o equipo puede tener como máximo 1 canasta de cada número o letra (A, 4, 5, 6, 7, 8, 9, 10, J, Q, K) y 1 canasta de comodines por ronda.\n\nEn el panel de puntos, cada figura tiene un selector "Ninguna / Pura / Impura": por eso es imposible cargar dos canastas del mismo símbolo para el mismo equipo.',
      },
    ],
  },
  {
    id: 'pozo',
    titulo: '3. El pozo y los requisitos de apertura',
    items: [
      {
        titulo: '🕳️ Cómo se levanta el pozo',
        texto:
          'Para levantar el pozo por primera vez (abrirse) hace falta cumplir dos condiciones:\n\n1. Tener en la mano dos cartas naturales iguales a la carta superior del pozo (sin comodines) para armar el juego.\n2. Que el valor de las cartas que se bajan alcance el puntaje mínimo de apertura.\n\nLevantar la carta superior obliga a llevarse todo el pozo.',
      },
      {
        titulo: '📊 Puntaje mínimo para abrirse',
        texto: `El mínimo depende del puntaje acumulado del jugador o equipo al INICIO de la ronda:\n\n${textoTramos}\n\nLa app lo calcula automáticamente y lo muestra debajo del nombre de cada jugador/equipo en cada ronda.\n\nSi en tu mesa se juega con otros mínimos, los podés cambiar al crear la partida o durante el juego.`,
      },
    ],
  },
  {
    id: 'cierre',
    titulo: '4. Tapar el pozo y cierre de ronda',
    items: [
      {
        titulo: '🛑 Tapar el pozo con los Tres Negros',
        texto: `Descartar un Tres Negro sobre el pozo lo bloquea: el siguiente jugador no puede levantarlo. El efecto dura un turno, hasta que alguien descarta otra carta encima.\n\nLos Tres Negros no valen puntos a favor y si te quedan en la mano cuando termina la ronda restan −${penalidadTresNegro} puntos cada uno.`,
      },
      {
        titulo: '🔴 Los Tres Rojos',
        texto: `Son cartas de bonificación y no sirven para formar canastas. Se bajan apenas se tienen y se reemplazan robando del mazo.\n\n• 1 Tres Rojo: +${tresRojos[1]}\n• 2 Tres Rojos: +${tresRojos[2]}\n• 3 Tres Rojos: +${tresRojos[3]}\n• 4 Tres Rojos: +${tresRojos[4]}\n• 5 Tres Rojos: +${pts(tresRojos[5])}\n• Más de 5 (con 4 mazos o más): +${pts(tresRojos[5])} por los primeros 5, más +${CONFIG_PUNTAJE.tresRojoExtra} por cada Tres Rojo adicional (6 = +${pts(tresRojos[5] + CONFIG_PUNTAJE.tresRojoExtra)}, 7 = +${pts(tresRojos[5] + 2 * CONFIG_PUNTAJE.tresRojoExtra)}, 8 = +${pts(tresRojos[5] + 3 * CONFIG_PUNTAJE.tresRojoExtra)}…).`,
      },
      {
        titulo: '🪞 El espejito',
        texto: `Si al momento de repartir la carta que se da vuelta en el pozo es la misma que tenés en tu mano, tenés espejito y sumás un bono de +${bonoEspejito} puntos.\n\nEn la app se marca con el interruptor "¿Tenés espejito?" en las bonificaciones de cada jugador o equipo, y aparece en el resumen de la ronda y en el historial.`,
      },
      {
        titulo: '🧺 Premio por cantidad de canastas',
        texto: 'Es un premio opcional que se configura al crear la partida (y se puede cambiar durante el juego). Elegís cuántas canastas hay que alcanzar o superar en una misma ronda y cuántos puntos extra suma ese premio.\n\nSi un jugador o equipo llega a esa cantidad, el premio se suma una sola vez en esa ronda y aparece en sus bonos.',
      },
      {
        titulo: '🏁 Cerrar la ronda',
        texto: `Quien se queda sin cartas en la mano cierra la ronda y suma un bono de +${bonoCierre} puntos (distinto del bono del corte exacto al repartir). Solo un jugador o equipo puede cerrar cada ronda.\n\nLos demás restan los puntos de las cartas que les quedaron en la mano.`,
      },
    ],
  },
  {
    id: 'puntaje',
    titulo: '5. Cómo se cuenta una ronda en la app',
    items: [
      {
        titulo: '📱 Los 4 bloques de carga',
        texto: `Al terminar la ronda, cada jugador/equipo carga:\n\n1. BONIFICACIONES: corte exacto (+${bonoCorteExacto}), cierre (+${bonoCierre}), espejito (+${bonoEspejito}) y Tres Rojos.\n2. CANASTAS: pura / impura por figura, Ases y Comodines.\n3. CARTAS EN MESA (a favor): cantidad de cartas de 5, 10, 20 y Jokers; la app multiplica por vos.\n4. CARTAS EN MANO (en contra): Tres Negros y cartas que quedaron sin bajar.\n\nPuntaje de la ronda = Canastas + Cartas + Bonos − Penalizaciones.`,
      },
      {
        titulo: '🏆 Cómo se gana',
        texto: `Gana quien llega primero al puntaje objetivo. Por defecto son ${textoObjetivo}, pero podés elegir otra meta (o jugar sin límite) al crear la partida.\n\nCuando alguien alcanza la meta, la app te ofrece confirmar el resultado final; también podés seguir jugando o terminar la partida cuando quieras.`,
      },
    ],
  },
  {
    id: 'variantes',
    titulo: '6. Notas y variantes por región',
    items: [
      {
        titulo: '🌎 La Canasta tiene muchas versiones',
        texto: `El juego nació en Uruguay y se popularizó por toda América con pequeñas diferencias entre mesas. Esta app sigue las reglas de tu mesa. Otras fuentes (por ejemplo, el manual de Fournier) describen:\n\n• Meta de 5.000 puntos.\n• El pozo arranca con una sola carta boca arriba tras repartir 11 cartas por jugador.\n• Los 4 Tres Rojos valen 800 y los Tres Negros penalizan distinto.\n• Mínimos de apertura de 50 / 90 / 150 puntos (y 15 si el puntaje es negativo).\n• Premios por cantidad de canastas: Canastrón (5 canastas) +${CONFIG_PUNTAJE.premioCanastron.puntos} y Canasta de canastas (7) +${pts(CONFIG_PUNTAJE.premioCanastaDeCanastas.puntos)}.\n\nEl premio por cantidad de canastas es opcional: al crear la partida elegís a cuántas canastas se llega y cuántos puntos extra suma.`,
      },
    ],
  },
];
