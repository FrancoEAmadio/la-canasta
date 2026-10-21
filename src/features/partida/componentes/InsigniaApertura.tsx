import { nivelApertura, requisitoApertura, type ConfigApertura } from '../../../dominio/apertura';

const ESTILOS_NIVEL = [
  'border-blue-200 bg-blue-50 text-azul',
  'border-amber-300 bg-amber-50 text-amber-800',
  'border-red-300 bg-red-50 text-rojo-osc',
] as const;

interface Props {
  puntosAcumulados: number;
  /** Mínimos de la partida (cada partida puede tener los suyos). */
  config: ConfigApertura;
  /** Variante compacta (una sola línea). */
  compacta?: boolean;
}

/** Cuánto hay que bajar para abrirse / levantar el pozo, calculado según el acumulado. */
export function InsigniaApertura({ puntosAcumulados, config, compacta = false }: Props) {
  const requisito = requisitoApertura(puntosAcumulados, config);
  const nivel = Math.min(nivelApertura(puntosAcumulados, config), ESTILOS_NIVEL.length - 1);

  return (
    <div className={`rounded-xl border px-3 py-2 ${ESTILOS_NIVEL[nivel]}`}>
      <div className="flex items-center gap-2 text-sm font-black">
        <span aria-hidden="true">🔓</span>
        <span>
          Para abrirte: mínimo <span className="text-base">{requisito}</span> pts
        </span>
      </div>
      {!compacta && <p className="mt-0.5 text-[11px] font-semibold opacity-80">y tener en mano un par natural de la carta superior del pozo.</p>}
    </div>
  );
}
