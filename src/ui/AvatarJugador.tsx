import type { Palo } from '../tipos';
import { SimboloPalo } from './SimboloPalo';

const TAMANOS = {
  sm: { caja: 'h-8 w-8', icono: 'h-4 w-4' },
  md: { caja: 'h-11 w-11', icono: 'h-6 w-6' },
  lg: { caja: 'h-14 w-14', icono: 'h-8 w-8' },
} as const;

export function AvatarJugador({ palo, tamano = 'md' }: { palo: Palo; tamano?: keyof typeof TAMANOS }) {
  const medidas = TAMANOS[tamano];
  const rojo = palo === 'corazones' || palo === 'diamantes';
  return (
    <span
      className={`flex ${medidas.caja} shrink-0 items-center justify-center rounded-full border-2 bg-white ${
        rojo ? 'border-rojo' : 'border-azul'
      }`}
    >
      <SimboloPalo palo={palo} className={medidas.icono} />
    </span>
  );
}
