import type { Palo } from '../tipos';
import { COLOR_NEGRO, COLOR_ROJO, FormaPalo, NOMBRE_PALO, colorDelPalo } from './SimboloPalo';

type Tamano = 'sm' | 'md' | 'lg';

interface Props {
  rango: string;
  palo?: Palo;
  joker?: 'rojo' | 'negro';
  tamano?: Tamano;
}

const CLASES_TAMANO: Record<Tamano, string> = {
  sm: 'w-[2.55rem]',
  md: 'w-[3.75rem]',
  lg: 'w-24',
};

interface Pip {
  x: number;
  y: number;
}

const IZQ = 33;
const CEN = 50;
const DER = 67;
const ARR = 38;
const MED = 70;
const ABA = 102;

const DISTRIBUCION_PIPS: Record<string, Pip[]> = {
  '2': [{ x: CEN, y: ARR }, { x: CEN, y: ABA }],
  '3': [{ x: CEN, y: ARR }, { x: CEN, y: MED }, { x: CEN, y: ABA }],
  '4': [{ x: IZQ, y: ARR }, { x: DER, y: ARR }, { x: IZQ, y: ABA }, { x: DER, y: ABA }],
  '5': [{ x: IZQ, y: ARR }, { x: DER, y: ARR }, { x: CEN, y: MED }, { x: IZQ, y: ABA }, { x: DER, y: ABA }],
  '6': [
    { x: IZQ, y: ARR }, { x: DER, y: ARR },
    { x: IZQ, y: MED }, { x: DER, y: MED },
    { x: IZQ, y: ABA }, { x: DER, y: ABA },
  ],
  '7': [
    { x: IZQ, y: ARR }, { x: DER, y: ARR },
    { x: CEN, y: 54 },
    { x: IZQ, y: MED }, { x: DER, y: MED },
    { x: IZQ, y: ABA }, { x: DER, y: ABA },
  ],
  '8': [
    { x: IZQ, y: ARR }, { x: DER, y: ARR },
    { x: CEN, y: 54 },
    { x: IZQ, y: MED }, { x: DER, y: MED },
    { x: CEN, y: 86 },
    { x: IZQ, y: ABA }, { x: DER, y: ABA },
  ],
  '9': [
    { x: IZQ, y: ARR }, { x: DER, y: ARR },
    { x: IZQ, y: 59 }, { x: DER, y: 59 },
    { x: CEN, y: MED },
    { x: IZQ, y: 81 }, { x: DER, y: 81 },
    { x: IZQ, y: ABA }, { x: DER, y: ABA },
  ],
  '10': [
    { x: IZQ, y: ARR }, { x: DER, y: ARR },
    { x: CEN, y: 48 },
    { x: IZQ, y: 59 }, { x: DER, y: 59 },
    { x: IZQ, y: 81 }, { x: DER, y: 81 },
    { x: CEN, y: 92 },
    { x: IZQ, y: ABA }, { x: DER, y: ABA },
  ],
};

function PaloEn({ palo, x, y, tam, girar = false }: { palo: Palo; x: number; y: number; tam: number; girar?: boolean }) {
  const escala = tam / 24;
  const giro = girar ? ` rotate(180 12 12)` : '';
  return (
    <g transform={`translate(${x - tam / 2} ${y - tam / 2}) scale(${escala})${giro}`} fill={colorDelPalo(palo)}>
      <FormaPalo palo={palo} />
    </g>
  );
}

function IndiceEsquina({ rango, palo }: { rango: string; palo: Palo }) {
  const color = colorDelPalo(palo);
  const tamanoLetra = rango.length > 1 ? 17 : 21;
  return (
    <g>
      <text
        x={13}
        y={26}
        textAnchor="middle"
        fontSize={tamanoLetra}
        fontWeight={800}
        fontFamily="Georgia, 'Times New Roman', serif"
        fill={color}
      >
        {rango}
      </text>
      <PaloEn palo={palo} x={13} y={37} tam={12} />
    </g>
  );
}

function CartaJoker({ color }: { color: 'rojo' | 'negro' }) {
  const tinta = color === 'rojo' ? COLOR_ROJO : COLOR_NEGRO;
  const puntas = Array.from({ length: 10 }, (_, i) => {
    const radio = i % 2 === 0 ? 27 : 12;
    const angulo = (Math.PI / 5) * i - Math.PI / 2;
    return `${(50 + radio * Math.cos(angulo)).toFixed(1)},${(66 + radio * Math.sin(angulo)).toFixed(1)}`;
  }).join(' ');
  return (
    <g>
      <text x={14} y={70} textAnchor="middle" fontSize={11} fontWeight={800} letterSpacing={2} fill={tinta} fontFamily="Georgia, serif" transform="rotate(-90 14 70)">
        JOKER
      </text>
      <text x={86} y={70} textAnchor="middle" fontSize={11} fontWeight={800} letterSpacing={2} fill={tinta} fontFamily="Georgia, serif" transform="rotate(90 86 70)">
        JOKER
      </text>
      <polygon points={puntas} fill={tinta} />
      <circle cx={50} cy={66} r={7} fill="#fff" />
      <circle cx={50} cy={66} r={3.2} fill={tinta} />
      <path d="M36 32 Q50 14 64 32 Q50 26 36 32z" fill={tinta} />
      <circle cx={36} cy={32} r={3} fill={tinta} />
      <circle cx={64} cy={32} r={3} fill={tinta} />
      <circle cx={50} cy={17} r={3} fill={tinta} />
      <path d="M36 112 Q50 126 64 112 Q50 118 36 112z" fill={tinta} />
    </g>
  );
}

/** Naipe de póker dibujado en SVG: siempre nítido y sin depender de imágenes externas. */
export function Naipe({ rango, palo, joker, tamano = 'md' }: Props) {
  const etiqueta = joker
    ? `Joker ${joker}`
    : `${rango} de ${palo ? NOMBRE_PALO[palo].toLowerCase() : ''}`.trim();
  const esFigura = rango === 'J' || rango === 'Q' || rango === 'K';
  const color = palo ? colorDelPalo(palo) : COLOR_NEGRO;
  const pips = DISTRIBUCION_PIPS[rango];

  return (
    <svg
      viewBox="0 0 100 140"
      className={`naipe ${CLASES_TAMANO[tamano]}`}
      role="img"
      aria-label={etiqueta}
    >
      <rect x={1.5} y={1.5} width={97} height={137} rx={9} fill="#fff" stroke="#cbd5e1" strokeWidth={1.5} />

      {joker ? (
        <CartaJoker color={joker} />
      ) : (
        palo && (
          <>
            <IndiceEsquina rango={rango} palo={palo} />
            <g transform="rotate(180 50 70)">
              <IndiceEsquina rango={rango} palo={palo} />
            </g>

            {rango === 'A' && <PaloEn palo={palo} x={50} y={70} tam={46} />}

            {pips?.map((pip, indice) => (
              <PaloEn key={indice} palo={palo} x={pip.x} y={pip.y} tam={17} girar={pip.y > MED} />
            ))}

            {esFigura && (
              <g>
                <rect
                  x={26}
                  y={30}
                  width={48}
                  height={80}
                  rx={5}
                  fill={color === COLOR_ROJO ? '#fef2f2' : '#eff6ff'}
                  stroke={color}
                  strokeWidth={2}
                />
                <rect x={30} y={34} width={40} height={72} rx={3} fill="none" stroke={color} strokeWidth={0.8} strokeDasharray="2 2" />
                <text
                  x={50}
                  y={84}
                  textAnchor="middle"
                  fontSize={44}
                  fontWeight={900}
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fill={color}
                >
                  {rango}
                </text>
                <PaloEn palo={palo} x={38} y={44} tam={10} />
                <PaloEn palo={palo} x={62} y={96} tam={10} girar />
              </g>
            )}
          </>
        )
      )}
    </svg>
  );
}
