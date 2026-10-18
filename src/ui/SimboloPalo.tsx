import type { Palo } from '../tipos';

export const COLOR_ROJO = '#DC2626';
export const COLOR_NEGRO = '#0F172A';

export function esPaloRojo(palo: Palo): boolean {
  return palo === 'corazones' || palo === 'diamantes';
}

export function colorDelPalo(palo: Palo): string {
  return esPaloRojo(palo) ? COLOR_ROJO : COLOR_NEGRO;
}

export const NOMBRE_PALO: Record<Palo, string> = {
  picas: 'Picas',
  corazones: 'Corazones',
  diamantes: 'Diamantes',
  treboles: 'Tréboles',
};

/** Dibujo vectorial de cada palo en una grilla de 24×24 (no depende de ninguna fuente tipográfica). */
export function FormaPalo({ palo }: { palo: Palo }) {
  switch (palo) {
    case 'corazones':
      return (
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      );
    case 'diamantes':
      return <path d="M12 1.5 20.5 12 12 22.5 3.5 12z" />;
    case 'picas':
      return (
        <path d="M12 1.8C12 1.8 3.5 8.2 3.5 14c0 2.9 2.2 4.8 4.7 4.8 1.4 0 2.6-.5 3.3-1.4-.1 2-.7 3.3-1.9 4.8h4.8c-1.2-1.5-1.8-2.8-1.9-4.8.7.9 1.9 1.4 3.3 1.4 2.5 0 4.7-1.9 4.7-4.8C20.5 8.2 12 1.8 12 1.8z" />
      );
    case 'treboles':
      return (
        <g>
          <circle cx="12" cy="7.2" r="4.6" />
          <circle cx="6.6" cy="14.2" r="4.6" />
          <circle cx="17.4" cy="14.2" r="4.6" />
          <path d="M12 9 7.6 15.2h8.8z" />
          <path d="M10.4 14h3.2l1 8.2H9.4z" />
        </g>
      );
  }
}

interface Props {
  palo: Palo;
  className?: string;
  /** Si no se pasa, usa el color tradicional del palo (rojo / negro). */
  color?: string;
  titulo?: string;
}

/** Ícono de palo para usar en HTML (botones, títulos, tarjetas de jugador…). */
export function SimboloPalo({ palo, className = 'h-5 w-5', color, titulo }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={color ?? colorDelPalo(palo)}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      <FormaPalo palo={palo} />
    </svg>
  );
}
