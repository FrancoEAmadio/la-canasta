import { CampoNumero } from '../../../ui/CampoNumero';

interface Props {
  umbrales: (number | null)[];
  requisitos: (number | null)[];
  onCambiar: (umbrales: (number | null)[], requisitos: (number | null)[]) => void;
}

const reemplazar = <T,>(lista: T[], indice: number, valor: T): T[] => lista.map((actual, i) => (i === indice ? valor : actual));
const mostrar = (valor: number | null) => (valor === null ? '…' : valor.toLocaleString('es-AR'));

/** Edita cuántos puntos mínimos hay que bajar para abrirse en cada tramo de puntaje acumulado. */
export function EditorApertura({ umbrales, requisitos, onCambiar }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {requisitos.map((requisito, indice) => {
        const esUltimo = indice === requisitos.length - 1;
        return (
          <div key={indice} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-sm font-semibold text-slate-700">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {indice === 0 ? <span>Menos de</span> : <span>Desde {mostrar(umbrales[indice - 1]!)} hasta menos de</span>}
              {!esUltimo && (
                <CampoNumero
                  valor={umbrales[indice]!}
                  onCambiar={(nuevo) => onCambiar(reemplazar(umbrales, indice, nuevo), requisitos)}
                  etiqueta={`Puntaje donde termina el tramo ${indice + 1}`}
                  min={1}
                  className="h-9 w-20 px-1 text-sm"
                />
              )}
              {esUltimo && <span>{mostrar(umbrales[indice - 1]!)} o más</span>}
              {!esUltimo && <span>pts</span>}
            </div>
            <span className="text-xs text-slate-500">mínimo</span>
            <CampoNumero
              valor={requisito}
              onCambiar={(nuevo) => onCambiar(umbrales, reemplazar(requisitos, indice, nuevo))}
              etiqueta={`Puntos mínimos para abrirse en el tramo ${indice + 1}`}
              min={0}
              className="h-9 w-16 px-1 text-sm text-azul"
            />
          </div>
        );
      })}
    </div>
  );
}
