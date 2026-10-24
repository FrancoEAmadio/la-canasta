import { useState } from 'react';

export interface SerieGrafico {
  nombre: string;
  /** Puntaje acumulado: posición 0 = antes de la primera ronda. */
  puntos: number[];
}

const COLORES = ['#1d4ed8', '#dc2626', '#059669', '#d97706', '#7c3aed', '#0891b2'];
const ANCHO = 320;
const ALTO = 170;
const MARGEN = { izq: 38, der: 10, arr: 10, aba: 22 };

/**
 * Gráfico de líneas con el puntaje acumulado de cada participante ronda a ronda.
 * Los nombres de la leyenda son botones: tocar uno apaga o prende su línea (siempre queda al menos una).
 */
export function GraficoEvolucion({ series }: { series: SerieGrafico[] }) {
  const [apagadas, setApagadas] = useState<ReadonlySet<number>>(new Set());

  const cantidadPuntos = Math.max(...series.map((serie) => serie.puntos.length), 0);
  if (cantidadPuntos < 2) return null;

  // Si cambia la cantidad de series (otra partida), se ignoran índices que ya no existen.
  const visibles = series.map((_, indice) => !apagadas.has(indice));
  const hayVisible = visibles.some(Boolean);
  const cantidadVisibles = visibles.filter(Boolean).length;
  const mostrar = (indice: number) => (hayVisible ? visibles[indice]! : true);

  const alternar = (indice: number) => {
    setApagadas((actuales) => {
      const siguientes = new Set(actuales);
      if (siguientes.has(indice)) siguientes.delete(indice);
      else if (series.length - siguientes.size > 1) siguientes.add(indice); // nunca apagar a todos
      return siguientes;
    });
  };

  // La escala se ajusta a las líneas encendidas, para comparar bien un mano a mano.
  const todos = series.flatMap((serie, indice) => (mostrar(indice) ? serie.puntos : []));
  const minimo = Math.min(0, ...todos);
  const maximo = Math.max(100, ...todos);
  const rango = maximo - minimo || 1;
  const anchoUtil = ANCHO - MARGEN.izq - MARGEN.der;
  const altoUtil = ALTO - MARGEN.arr - MARGEN.aba;

  const x = (indice: number) => MARGEN.izq + (indice / (cantidadPuntos - 1)) * anchoUtil;
  const y = (valor: number) => MARGEN.arr + (1 - (valor - minimo) / rango) * altoUtil;
  const marcasY = [minimo, minimo + rango / 2, maximo];

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="h-auto w-full" role="img" aria-label="Evolución del puntaje por ronda">
        {marcasY.map((marca) => (
          <g key={marca}>
            <line x1={MARGEN.izq} x2={ANCHO - MARGEN.der} y1={y(marca)} y2={y(marca)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={MARGEN.izq - 4} y={y(marca) + 3} textAnchor="end" fontSize={9} fill="#64748b">
              {Math.round(marca).toLocaleString('es-AR')}
            </text>
          </g>
        ))}
        {minimo < 0 && <line x1={MARGEN.izq} x2={ANCHO - MARGEN.der} y1={y(0)} y2={y(0)} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />}
        {Array.from({ length: cantidadPuntos }, (_, indice) => (
          <text key={indice} x={x(indice)} y={ALTO - 6} textAnchor="middle" fontSize={9} fill="#64748b">
            {indice === 0 ? 'Inicio' : `R${indice}`}
          </text>
        ))}
        {series.map((serie, indiceSerie) => {
          if (!mostrar(indiceSerie)) return null;
          const color = COLORES[indiceSerie % COLORES.length]!;
          const puntos = serie.puntos.map((valor, indice) => `${x(indice).toFixed(1)},${y(valor).toFixed(1)}`).join(' ');
          const ultimo = serie.puntos.length - 1;
          return (
            <g key={indiceSerie}>
              <polyline points={puntos} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={x(ultimo)} cy={y(serie.puntos[ultimo]!)} r={3.5} fill={color} />
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Mostrar u ocultar jugadores">
        {series.map((serie, indice) => {
          const encendida = mostrar(indice);
          const color = COLORES[indice % COLORES.length]!;
          const ultimaEncendida = encendida && cantidadVisibles <= 1;
          return (
            <button
              key={indice}
              type="button"
              aria-pressed={encendida}
              disabled={ultimaEncendida}
              title={ultimaEncendida ? 'Tiene que quedar al menos un jugador visible' : encendida ? 'Tocá para ocultar' : 'Tocá para mostrar'}
              onClick={() => alternar(indice)}
              className={`flex max-w-full items-start gap-1.5 rounded-full border px-2.5 py-1 text-left text-[11px] font-bold leading-tight ${
                encendida ? 'border-slate-300 bg-white text-slate-700' : 'border-slate-200 bg-slate-100 text-slate-400 line-through'
              }`}
              style={{ overflowWrap: 'anywhere' }}
            >
              <span className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: encendida ? color : '#cbd5e1' }} />
              {serie.nombre}
            </button>
          );
        })}
      </figcaption>
    </figure>
  );
}
