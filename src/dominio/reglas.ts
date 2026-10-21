import { MAZOS_DEFECTO, MAZOS_MAX, MAZOS_MIN } from '../constantes.ts';
import type { ReglasPartida } from '../tipos/index.ts';
import { aperturaPorDefecto } from './apertura.ts';

export function reglasPorDefecto(): ReglasPartida {
  return { premiosPorCantidad: false, mazos: MAZOS_DEFECTO, apertura: aperturaPorDefecto() };
}

/** La cantidad de mazos tiene que ser un número par entre el mínimo y el máximo. */
export function mazosValidos(mazos: number | null): mazos is number {
  return mazos !== null && Number.isInteger(mazos) && mazos >= MAZOS_MIN && mazos <= MAZOS_MAX && mazos % 2 === 0;
}
