import { CampoNumero } from '../../../ui/CampoNumero';

interface Props {
  umbrales: (number | null)[];
  requisitos: (number | null)[];
  onCambiar: (umbrales: (number | null)[], requisitos: (number | null)[]) => void;
}

const reemplazar = <T,>(lista: T[], indice: number, valor: T): T[] => lista.map((actual, i) => (i === indice ? valor : actual));
const mostrar = (valor: number | null) => (valor === null ? '…' : valor.toLocaleString('es-AR'));

/**
 * Edita cuántos puntos mínimos hay que bajar para abrirse en cada escalón de puntaje acumulado.
 * Cada escalón es una sub-tarjeta vertical: arriba el rango de puntos y abajo el mínimo requerido.
 */
export function EditorApertura({ umbrales, requisitos, onCambiar }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {requisitos.map((requisito, indice) => {
        const esUltimo = indice === requisitos.length - 1;
        return (
          <div key={indice} className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-azul">Escalón {indice + 1}</span>

            {/* Rango de puntos acumulados */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm font-semibold text-slate-700">
              {esUltimo ? (
                <span>Desde {mostrar(umbrales[indice - 1]!)} pts acumulados o más</span>
              ) : (
                <>
                  <span>{indice === 0 ? 'Menos de' : `Desde ${mostrar(umbrales[indice - 1]!)} hasta menos de`}</span>
                  <CampoNumero
                    valor={umbrales[indice]!}
                    onCambiar={(nuevo) => onCambiar(reemplazar(umbrales, indice, nuevo), requisitos)}
                    etiqueta={`Puntaje donde termina el escalón ${indice + 1}`}
                    min={1}
                    ancho={90}
                  />
                  <span>{indice === 0 ? 'pts acumulados' : 'pts'}</span>
                </>
              )}
            </div>

            {/* Mínimo requerido */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2.5">
              <span className="text-sm font-black text-tinta">Mínimo para abrirse:</span>
              <div className="flex items-center gap-2">
                <CampoNumero
                  valor={requisito}
                  onCambiar={(nuevo) => onCambiar(umbrales, reemplazar(requisitos, indice, nuevo))}
                  etiqueta={`Puntos mínimos para abrirse en el escalón ${indice + 1}`}
                  min={0}
                  ancho={110}
                />
                <span className="text-sm font-bold text-slate-600">pts</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
