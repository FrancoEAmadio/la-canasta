import type { ReactNode } from 'react';
import { CampoNumero } from '../../../ui/CampoNumero';

interface Props {
  umbrales: (number | null)[];
  requisitos: (number | null)[];
  onCambiar: (umbrales: (number | null)[], requisitos: (number | null)[]) => void;
}

const reemplazar = <T,>(lista: T[], indice: number, valor: T): T[] => lista.map((actual, i) => (i === indice ? valor : actual));
const mostrar = (valor: number | null) => (valor === null ? '…' : valor.toLocaleString('es-AR'));

/**
 * Todas las filas con un campo usan la misma grilla (etiqueta | campo de 110 px | "pts" de 28 px),
 * así los 5 campos quedan en una única columna vertical, alineados al píxel.
 */
const GRILLA = 'grid items-center gap-2 [grid-template-columns:1fr_110px_28px]';

function FilaCampo({ etiqueta, valor, onCambiar, ariaLabel, min, separada = false }: {
  etiqueta: ReactNode;
  valor: number | null;
  onCambiar: (nuevo: number | null) => void;
  ariaLabel: string;
  min: number;
  separada?: boolean;
}) {
  return (
    <div className={`${GRILLA} ${separada ? 'border-t border-slate-200 pt-2.5' : ''}`}>
      <span className="min-w-0 text-sm font-bold leading-tight text-slate-700">{etiqueta}</span>
      <CampoNumero valor={valor} onCambiar={onCambiar} etiqueta={ariaLabel} min={min} ancho={110} alto={42} />
      <span className="w-7 text-sm font-bold text-slate-600">pts</span>
    </div>
  );
}

/** Edita cuántos puntos mínimos hay que bajar para abrirse en cada escalón de puntaje acumulado. */
export function EditorApertura({ umbrales, requisitos, onCambiar }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {requisitos.map((requisito, indice) => {
        const esUltimo = indice === requisitos.length - 1;
        return (
          <div key={indice} className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-azul">Escalón {indice + 1}</span>

            {esUltimo ? (
              <p className="text-sm font-bold text-slate-700">Desde {mostrar(umbrales[indice - 1]!)} pts acumulados o más</p>
            ) : (
              <FilaCampo
                etiqueta={indice === 0 ? 'Menos de (acumulados):' : `Desde ${mostrar(umbrales[indice - 1]!)} hasta menos de:`}
                valor={umbrales[indice]!}
                onCambiar={(nuevo) => onCambiar(reemplazar(umbrales, indice, nuevo), requisitos)}
                ariaLabel={`Puntaje donde termina el escalón ${indice + 1}`}
                min={1}
              />
            )}

            <FilaCampo
              separada
              etiqueta="Mínimo para abrirse:"
              valor={requisito}
              onCambiar={(nuevo) => onCambiar(umbrales, reemplazar(requisitos, indice, nuevo))}
              ariaLabel={`Puntos mínimos para abrirse en el escalón ${indice + 1}`}
              min={0}
            />
          </div>
        );
      })}
    </div>
  );
}
