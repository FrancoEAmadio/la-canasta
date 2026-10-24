import assert from 'node:assert/strict';
import { test } from 'node:test';
import { aperturaValida, requisitoApertura, tramosApertura } from '../src/dominio/apertura.ts';
import {
  calcularEntrada,
  crearEntradaVacia,
  formatearPuntos,
  puntosTresRojos,
  subtotalBloque1,
  subtotalBloque2,
  subtotalBloque3,
  subtotalBloque4,
} from '../src/dominio/puntuacion.ts';
import { calcularRanking, crearPartida, nombreEquipo, objetivoAlcanzado, quienMezclaYReparte, subtituloParticipante, totalesPartida } from '../src/dominio/partida.ts';
import { reglasPorDefecto, mazosValidos } from '../src/dominio/reglas.ts';
import { advertenciasRonda, maxCartas, maxTresNegros, maxTresRojos } from '../src/dominio/validaciones.ts';
import type { Participante } from '../src/tipos/index.ts';

const jugadores = (...nombres: string[]): Participante[] =>
  nombres.map((nombre) => ({ id: nombre, nombre, jugadoresIds: [nombre], jugadoresNombres: [nombre] }));

test('requisito de apertura por escalones (15 / 50 / 90 / 120)', () => {
  assert.equal(requisitoApertura(-300), 15);
  assert.equal(requisitoApertura(-1), 15);
  assert.equal(requisitoApertura(0), 50);
  assert.equal(requisitoApertura(1499), 50);
  assert.equal(requisitoApertura(1500), 90);
  assert.equal(requisitoApertura(2999), 90);
  assert.equal(requisitoApertura(3000), 120);
  assert.equal(requisitoApertura(4800), 120);
  assert.deepEqual(tramosApertura().map((t) => t.requisito), [15, 50, 90, 120]);
});

test('Tres Rojos: 1=100, 2=200, 3=300, 4=500, 5=1000', () => {
  const entrada = crearEntradaVacia();
  const esperado = [0, 100, 200, 300, 500, 1000];
  esperado.forEach((puntos, cantidad) => {
    entrada.tresRojos = cantidad;
    assert.equal(calcularEntrada(entrada).total, puntos);
  });
});

test('canastas estándar, ases y comodines', () => {
  const entrada = crearEntradaVacia();
  entrada.canastas['8'] = 'pura'; // 500
  entrada.canastas['K'] = 'impura'; // 300
  entrada.canastas['A'] = 'pura'; // 1000
  assert.equal(subtotalBloque2(entrada), 1800);
  entrada.canastas['A'] = 'impura'; // 500
  assert.equal(subtotalBloque2(entrada), 1300);
  entrada.canastaComodines = true; // 2000
  assert.equal(subtotalBloque2(entrada), 3300);
});

test('cartas en mesa suman y cartas en mano restan', () => {
  const entrada = crearEntradaVacia();
  entrada.cartasMesa = { c5: 5, c10: 10, c20: 2, c50: 1 };
  assert.equal(subtotalBloque3(entrada), 25 + 100 + 40 + 50);
  entrada.cartasMano = { tresNegros: 2, c5: 1, c10: 2, c20: 1, c50: 1 };
  assert.equal(subtotalBloque4(entrada), -(200 + 5 + 20 + 20 + 50));
});

test('ejemplo completo: canastas + cartas + bonos − penalizaciones', () => {
  const entrada = crearEntradaVacia();
  entrada.corteExacto = true; // +100
  entrada.cerro = true; // +100
  entrada.tresRojos = 2; // +200
  entrada.canastas['5'] = 'pura'; // +500
  entrada.canastas['Q'] = 'impura'; // +300
  entrada.cartasMesa = { c5: 5, c10: 10, c20: 0, c50: 0 }; // +125
  entrada.cartasMano = { tresNegros: 1, c5: 0, c10: 1, c20: 0, c50: 0 }; // −110
  const desglose = calcularEntrada(entrada);
  assert.equal(desglose.subtotalBonos, 400);
  assert.equal(desglose.subtotalCanastas, 800);
  assert.equal(desglose.subtotalCartas, 125);
  assert.equal(desglose.subtotalPenalizaciones, -110);
  assert.equal(desglose.total, 400 + 800 + 125 - 110);
  assert.equal(subtotalBloque1(entrada), 400);
  assert.deepEqual(desglose.conteo, { puras: 1, impuras: 1, comodines: 0 });
});

test('espejito suma +100 como bonificación', () => {
  const entrada = crearEntradaVacia();
  entrada.espejito = true;
  const desglose = calcularEntrada(entrada);
  assert.equal(desglose.total, 100);
  assert.equal(subtotalBloque1(entrada), 100);
  assert.deepEqual(desglose.bonos.map((linea) => linea.clave), ['espejito']);
});

test('premio por cantidad de canastas configurable (alcanzar o superar)', () => {
  const entrada = crearEntradaVacia();
  for (const figura of ['4', '5', '6'] as const) entrada.canastas[figura] = 'impura'; // 3 canastas
  const reglas = { ...reglasPorDefecto(), premioCanastas: { activo: true, cantidad: 3, puntos: 700 } };
  const base = calcularEntrada(entrada, reglasPorDefecto()).total;
  assert.equal(calcularEntrada(entrada, reglas).total - base, 700); // alcanza
  entrada.canastas['7'] = 'impura'; // 4 canastas: supera, el premio se suma una sola vez
  assert.equal(calcularEntrada(entrada, reglas).total - calcularEntrada(entrada, reglasPorDefecto()).total, 700);
  const exigente = { ...reglas, premioCanastas: { activo: true, cantidad: 5, puntos: 700 } };
  assert.equal(calcularEntrada(entrada, exigente).total, calcularEntrada(entrada, reglasPorDefecto()).total); // no llega
  const desactivado = { ...reglas, premioCanastas: { activo: false, cantidad: 3, puntos: 700 } };
  assert.equal(calcularEntrada(entrada, desactivado).total, calcularEntrada(entrada, reglasPorDefecto()).total);
  const conPremio = calcularEntrada(entrada, reglas);
  assert.equal(conPremio.bonos.find((linea) => linea.clave === 'premio_canastas')?.puntos, 700);
});

test('partidas viejas conservan los premios fijos (Canastrón 5 / Canasta de canastas 7)', () => {
  const entrada = crearEntradaVacia();
  for (const figura of ['4', '5', '6', '7', '8'] as const) entrada.canastas[figura] = 'impura';
  const heredadas = { ...reglasPorDefecto(), premiosHeredados: true };
  assert.equal(calcularEntrada(entrada, heredadas).total - calcularEntrada(entrada).total, 500);
  entrada.canastas['9'] = 'impura';
  entrada.canastaComodines = true; // 7 canastas
  assert.equal(calcularEntrada(entrada, heredadas).total - calcularEntrada(entrada).total, 2000);
});

test('formato de puntos', () => {
  assert.equal(formatearPuntos(-50), '−50');
  assert.equal(formatearPuntos(50, true), '+50');
  assert.equal(formatearPuntos(0, true), '0');
});

test('acumulados, ranking con empates y objetivo', () => {
  const participantes = jugadores('Ana', 'Beto', 'Caro');
  const partida = crearPartida({ modo: 'individual', participantes, objetivo: 1000, reglas: reglasPorDefecto() });
  const ronda = { numero: 1, entradas: Object.fromEntries(participantes.map((p) => [p.id, crearEntradaVacia()])) };
  ronda.entradas['Ana']!.tresRojos = 4; // 500
  ronda.entradas['Beto']!.tresRojos = 0;
  ronda.entradas['Caro']!.cartasMesa.c10 = 0;
  partida.rondas.push(ronda);
  const totales = totalesPartida(partida);
  assert.deepEqual(totales, { Ana: 500, Beto: 0, Caro: 0 });
  const ranking = calcularRanking(partida);
  assert.deepEqual(ranking.map((fila) => fila.posicion), [1, 2, 2]);
  assert.equal(objetivoAlcanzado(1000, totales), false);
  assert.equal(objetivoAlcanzado(500, totales), true);
  assert.equal(objetivoAlcanzado(null, { Ana: 99999 }), false);
});

test('orden de mesa en parejas alterna equipos y rota el reparto', () => {
  const equipos: Participante[] = [
    { id: 'eq_1', nombre: 'A y B', jugadoresIds: ['a', 'b'], jugadoresNombres: ['A', 'B'] },
    { id: 'eq_2', nombre: 'C y D', jugadoresIds: ['c', 'd'], jugadoresNombres: ['C', 'D'] },
  ];
  const partida = crearPartida({ modo: 'parejas', participantes: equipos, objetivo: null, reglas: reglasPorDefecto() });
  assert.deepEqual(partida.ordenMesa, ['A', 'C', 'B', 'D']);
  assert.deepEqual(quienMezclaYReparte(partida, 1), { mezcla: 'A', reparte: 'C' });
  assert.deepEqual(quienMezclaYReparte(partida, 4), { mezcla: 'D', reparte: 'A' });
});

test('límites del mazo: no se pueden cargar más Tres Rojos ni Jokers que los que existen', () => {
  const participantes = jugadores('Ana', 'Beto');
  const entradas = { Ana: crearEntradaVacia(), Beto: crearEntradaVacia() };
  entradas.Ana.tresRojos = 3;
  assert.equal(maxTresRojos(entradas, 'Beto', 2), 1);
  assert.equal(maxTresRojos(entradas, 'Ana', 2), 4);
  entradas.Ana.cartasMesa.c50 = 3;
  entradas.Beto.cartasMano.c50 = 1;
  assert.equal(maxCartas(entradas, 'Beto', 'mesa', 'c50', 2), 0);
  assert.equal(maxCartas(entradas, 'Ana', 'mesa', 'c50', 2), 3);
  assert.equal(participantes.length, 2);
});

test('advertencias: cierre sin canasta y canastas imposibles', () => {
  const participantes = jugadores('Ana', 'Beto');
  const entradas = { Ana: crearEntradaVacia(), Beto: crearEntradaVacia() };
  entradas.Ana.cerro = true;
  assert.equal(advertenciasRonda(participantes, entradas, 2).length, 1);
  entradas.Ana.canastas['8'] = 'pura';
  entradas.Beto.canastas['8'] = 'impura';
  entradas.Ana.canastaComodines = true;
  entradas.Beto.canastaComodines = true;
  assert.equal(advertenciasRonda(participantes, entradas, 2).length, 2);
});

test('mínimos de apertura editables: se usa la configuración de la partida', () => {
  const propia = { umbrales: [1000, 3000], requisitos: [30, 60, 100] };
  assert.equal(requisitoApertura(999, propia), 30);
  assert.equal(requisitoApertura(1000, propia), 60);
  assert.equal(requisitoApertura(3000, propia), 100);
  assert.equal(aperturaValida(propia), true);
  assert.equal(aperturaValida({ umbrales: [3000, 1000], requisitos: [30, 60, 100] }), false);
  assert.equal(aperturaValida({ umbrales: [1000], requisitos: [30, 60, 100] }), false);
});

test('Tres Rojos con más mazos: 1000 por los primeros 5 y +100 por cada extra', () => {
  assert.equal(puntosTresRojos(4), 500);
  assert.equal(puntosTresRojos(5), 1000);
  assert.equal(puntosTresRojos(6), 1100);
  assert.equal(puntosTresRojos(7), 1200);
  assert.equal(puntosTresRojos(8), 1300);
});

test('cantidad de mazos: par entre 2 y 12', () => {
  assert.equal(mazosValidos(2), true);
  assert.equal(mazosValidos(4), true);
  assert.equal(mazosValidos(3), false);
  assert.equal(mazosValidos(0), false);
  assert.equal(mazosValidos(null), false);
});

test('límites de cartas escalan con la cantidad de mazos (2 / 4 / 6)', () => {
  const entradas = { Ana: crearEntradaVacia() };
  const esperado: Record<number, Record<string, number>> = {
    2: { c5: 32, c10: 48, c20: 16, c50: 4, tresRojos: 4, tresNegros: 4 },
    4: { c5: 64, c10: 96, c20: 32, c50: 8, tresRojos: 8, tresNegros: 8 },
    6: { c5: 96, c10: 144, c20: 48, c50: 12, tresRojos: 12, tresNegros: 12 },
  };
  for (const [mazos, limites] of Object.entries(esperado)) {
    const n = Number(mazos);
    for (const clave of ['c5', 'c10', 'c20', 'c50'] as const) {
      assert.equal(maxCartas(entradas, 'Ana', 'mesa', clave, n), limites[clave]);
      assert.equal(maxCartas(entradas, 'Ana', 'mano', clave, n), limites[clave]);
    }
    assert.equal(maxTresRojos(entradas, 'Ana', n), limites.tresRojos);
    assert.equal(maxTresNegros(entradas, 'Ana', n), limites.tresNegros);
  }
});

test('nombre de equipo: "Franco y Sol"; el subtítulo solo aparece en partidas viejas', () => {
  assert.equal(nombreEquipo(['Franco', 'Sol']), 'Franco y Sol');
  const nuevo = { id: 'e', nombre: 'Franco y Sol', jugadoresIds: ['1', '2'], jugadoresNombres: ['Franco', 'Sol'] };
  const viejo = { ...nuevo, nombre: 'Equipo 1' };
  assert.equal(subtituloParticipante(nuevo), '');
  assert.equal(subtituloParticipante(viejo), 'Franco + Sol');
});

test('advertencias de canastas se adaptan a la cantidad de mazos', () => {
  const participantes = jugadores('Ana', 'Beto');
  const entradas = { Ana: crearEntradaVacia(), Beto: crearEntradaVacia() };
  entradas.Ana.canastas['8'] = 'pura';
  entradas.Beto.canastas['8'] = 'pura';
  assert.equal(advertenciasRonda(participantes, entradas, 2).length, 1); // 14 naturales > 8
  assert.equal(advertenciasRonda(participantes, entradas, 4).length, 0); // 14 ≤ 16
  entradas.Ana.canastaComodines = true;
  entradas.Beto.canastaComodines = true;
  assert.equal(advertenciasRonda(participantes, entradas, 2).length, 2); // 14 > 12
  assert.equal(advertenciasRonda(participantes, entradas, 4).length, 0); // 14 ≤ 24
});
