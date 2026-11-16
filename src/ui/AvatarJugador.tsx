import { fondoSuave } from '../datos/coloresJugador';
import type { Palo } from '../tipos';
import { SimboloPalo } from './SimboloPalo';

const TAMANOS = {
  sm: { caja: 'h-8 w-8', icono: 'h-4 w-4' },
  md: { caja: 'h-11 w-11', icono: 'h-6 w-6' },
  lg: { caja: 'h-14 w-14', icono: 'h-8 w-8' },
} as const;

/** Círculo con el palo del jugador; el borde y el fondo clarito son su color propio. */
export function AvatarJugador({ palo, color, tamano = 'md' }: { palo: Palo; color?: string; tamano?: keyof typeof TAMANOS }) {
  const medidas = TAMANOS[tamano];
  const rojo = palo === 'corazones' || palo === 'diamantes';
  return (
    <span
      className={`flex ${medidas.caja} shrink-0 items-center justify-center rounded-full border-2 bg-white ${color ? '' : rojo ? 'border-rojo' : 'border-azul'}`}
      style={color ? { borderColor: color, backgroundColor: fondoSuave(color) } : undefined}
    >
      <SimboloPalo palo={palo} className={medidas.icono} />
    </span>
  );
}
