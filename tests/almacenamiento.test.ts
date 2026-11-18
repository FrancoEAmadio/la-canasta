/** Datos viejos o rotos: lo guardado por versiones anteriores (o a medias) nunca debe dejar la app en blanco. */
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { cargarAjustes, cargarJugadores, cargarPartidas, interpretarCopiaSeguridad } from '../src/infra/almacenamiento.ts';
import { CLAVE_LS_AJUSTES, CLAVE_LS_JUGADORES, CLAVE_LS_PARTIDAS_EN_CURSO, CLAVE_LS_PARTIDAS_FINALIZADAS } from '../src/constantes.ts';

function instalarLocalStorage(datos: Record<string, string>) {
  const almacen = new Map(Object.entries(datos));
  (globalThis as { localStorage?: unknown }).localStorage = ({
    getItem: (k: string) => almacen.get(k) ?? null,
    setItem: (k: string, v: string) => void almacen.set(k, String(v)),
    removeItem: (k: string) => void almacen.delete(k),
    clear: () => almacen.clear(),
  });
}

function crearAzar(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLAVES_OBJETO = ['id', 'nombre', 'jugadores', 'equipos', 'rondas', 'modo', 'participantes', 'puntos', 'fecha', 'color', 'palo', 'estado', 'config', 'mazos', 'ajustes', 'orden', 'jugadoresIds', 'bonos', 'canastas'];

function valorRaro(azar: () => number, profundidad = 0): unknown {
  const r = azar();
  if (r < 0.1) return null;
  if (r < 0.2) return 'texto';
  if (r < 0.3) return -3;
  if (r < 0.4) return {};
  if (r < 0.5) return [];
  if (r < 0.6 || profundidad > 2) return true;
  if (r < 0.8) return Array.from({ length: Math.floor(azar() * 4) }, () => valorRaro(azar, profundidad + 1));
  const o: Record<string, unknown> = {};
  for (const k of CLAVES_OBJETO) if (azar() < 0.4) o[k] = valorRaro(azar, profundidad + 1);
  return o;
}

describe('datos viejos o rotos en localStorage', () => {
  beforeEach(() => instalarLocalStorage({}));

  it('JSON inválido: se carga vacío, sin errores', () => {
    instalarLocalStorage({
      [CLAVE_LS_JUGADORES]: '{no es json',
      [CLAVE_LS_PARTIDAS_EN_CURSO]: '<<<',
      [CLAVE_LS_PARTIDAS_FINALIZADAS]: 'undefined',
      [CLAVE_LS_AJUSTES]: '[[[',
    });
    assert.deepEqual(cargarJugadores(), []);
    assert.deepEqual(cargarPartidas(), []);
    assert.doesNotThrow(() => cargarAjustes());
  });

  it('miles de combinaciones de datos raros nunca rompen la carga', () => {
    const azar = crearAzar(21);
    for (let i = 0; i < 3000; i++) {
      instalarLocalStorage({
        [CLAVE_LS_JUGADORES]: JSON.stringify(valorRaro(azar)),
        [CLAVE_LS_PARTIDAS_EN_CURSO]: JSON.stringify(valorRaro(azar)),
        [CLAVE_LS_PARTIDAS_FINALIZADAS]: JSON.stringify(valorRaro(azar)),
        [CLAVE_LS_AJUSTES]: JSON.stringify(valorRaro(azar)),
      });
      const contexto = `iteración ${i}`;
      assert.doesNotThrow(() => cargarJugadores(), contexto);
      assert.doesNotThrow(() => cargarPartidas(), contexto);
      assert.doesNotThrow(() => cargarAjustes(), contexto);
      assert.ok(Array.isArray(cargarJugadores()), contexto);
      assert.ok(Array.isArray(cargarPartidas()), contexto);
    }
  });

  it('importar copias de seguridad rotas devuelve null, nunca una excepción', () => {
    const azar = crearAzar(22);
    for (let i = 0; i < 3000; i++) {
      const texto = azar() < 0.2 ? 'no json' : JSON.stringify({ app: 'la-canasta', version: 1, jugadores: valorRaro(azar), partidas: valorRaro(azar), ajustes: valorRaro(azar) });
      assert.doesNotThrow(() => interpretarCopiaSeguridad(texto), `iteración ${i}: ${texto.slice(0, 120)}`);
    }
  });
});
