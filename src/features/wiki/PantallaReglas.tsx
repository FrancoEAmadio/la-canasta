import { useMemo, useState } from 'react';
import { CATALOGO_CARTAS } from '../../datos/cartasDatos';
import { CATEGORIAS_REGLAS } from '../../datos/reglasDatos';
import { useApp } from '../../estado/AppProvider';
import { vibrar } from '../../infra/vibracion';
import { Naipe } from '../../ui/Naipe';
import { useGestosMultiDedo } from '../../ui/useGestosMultiDedo';

type Vista = 'reglas' | 'cartas';
const VISTAS: { id: Vista; etiqueta: string }[] = [
  { id: 'reglas', etiqueta: 'Reglas de Juego' },
  { id: 'cartas', etiqueta: 'Catálogo de Cartas' },
];

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
    .trim();
}

export function PantallaReglas() {
  const { setPantallaActual } = useApp();
  const [vista, setVista] = useState<Vista>('reglas');
  const [categoriaAbierta, setCategoriaAbierta] = useState<string | null>('mazo');
  const [reglasAbiertas, setReglasAbiertas] = useState<Record<string, boolean>>({});
  const [termino, setTermino] = useState('');
  const [direccion, setDireccion] = useState<1 | -1>(1);

  const irAVista = (id: Vista) => {
    const nuevo = VISTAS.findIndex((v) => v.id === id);
    const actual = VISTAS.findIndex((v) => v.id === vista);
    if (nuevo === actual) return;
    setDireccion(nuevo > actual ? 1 : -1);
    setVista(id);
  };
  // Dos dedos: pasa de Reglas a Catálogo y viceversa. Un dedo nunca desliza (es para scrollear).
  const gestos = useGestosMultiDedo({
    dos: (dir) => {
      const i = VISTAS.findIndex((v) => v.id === vista) + dir;
      if (i >= 0 && i < VISTAS.length) {
        vibrar();
        irAVista(VISTAS[i]!.id);
      }
    },
  });
  const animacion = direccion > 0 ? 'entra-derecha' : 'entra-izquierda';

  const grupos = useMemo(() => {
    const patron = normalizar(termino);
    if (!patron) return CATALOGO_CARTAS;
    return CATALOGO_CARTAS.filter((grupo) => {
      const texto = normalizar([grupo.titulo, grupo.valorIndividual, grupo.valorCanasta ?? '', grupo.funcion, grupo.nota ?? '', ...grupo.palabrasClave].join(' '));
      return texto.includes(patron);
    });
  }, [termino]);

  return (
    <main className="entrar flex w-full flex-1 flex-col gap-4 pb-5" {...gestos}>
      {/* Menú fijo: queda a la vista al scrollear. */}
      <div className="sangrado sticky top-0 z-20 flex flex-col gap-2 bg-noche-2/95 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-lg shadow-black/20 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => setPantallaActual('inicio')} className="btn-fantasma px-3 py-2 text-sm">
            ← Menú
          </button>
          <h2 className="font-display text-lg font-bold text-white">Manual y cartas</h2>
        </div>

        <div className="grid grid-cols-2 gap-2" role="tablist">
          {VISTAS.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={vista === v.id}
              onClick={() => irAVista(v.id)}
              className={`${vista === v.id ? 'btn-primario border-white/40' : 'btn-fantasma'} min-h-12 py-2 text-sm`}
            >
              {v.etiqueta}
            </button>
          ))}
        </div>

        {vista === 'cartas' && (
          <div className="relative">
            <input
              value={termino}
              onChange={(evento) => setTermino(evento.target.value)}
              type="search"
              placeholder="Buscar carta (ej: K, joker, pozo)..."
              aria-label="Buscar en el catálogo de cartas"
              className="campo pr-10"
            />
            {termino && (
              <button type="button" onClick={() => setTermino('')} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {vista === 'reglas' ? (
        <div key="reglas" className={`flex flex-col gap-2.5 ${animacion}`}>
          {CATEGORIAS_REGLAS.map((categoria) => {
            const abierta = categoriaAbierta === categoria.id;
            return (
              <div key={categoria.id} className="tarjeta overflow-hidden">
                <button
                  type="button"
                  aria-expanded={abierta}
                  onClick={() => setCategoriaAbierta(abierta ? null : categoria.id)}
                  className={`flex w-full items-center justify-between p-4 text-left text-sm font-bold ${abierta ? 'bg-azul text-white' : 'bg-white text-azul'}`}
                >
                  <span>{categoria.titulo}</span>
                  <span aria-hidden="true">{abierta ? '▲' : '▼'}</span>
                </button>
                {abierta && (
                  <div className="flex flex-col gap-3 p-4">
                    {categoria.items.map((regla, indice) => {
                      const clave = `${categoria.id}-${indice}`;
                      const itemAbierto = reglasAbiertas[clave] ?? false;
                      return (
                        <div key={clave} className="border-b border-slate-200 pb-3 last:border-none last:pb-0">
                          <button
                            type="button"
                            aria-expanded={itemAbierto}
                            onClick={() => setReglasAbiertas((actual) => ({ ...actual, [clave]: !actual[clave] }))}
                            className="flex w-full items-center justify-between py-1 text-left text-sm font-bold text-tinta"
                          >
                            <span>{regla.titulo}</span>
                            <span className="text-xs font-bold text-azul-vivo">{itemAbierto ? '−' : '+'}</span>
                          </button>
                          {itemAbierto && <p className="mt-2 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-700">{regla.texto}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div key="cartas" className={`flex flex-col gap-3 ${animacion}`}>
          {grupos.length === 0 && <div className="tarjeta p-8 text-center text-sm text-slate-600">No hay cartas que coincidan con «{termino}».</div>}
          {grupos.map((grupo) => (
            <article key={grupo.id} className="tarjeta flex flex-col gap-3 p-4">
              <h3 className="font-display text-lg font-bold text-azul">{grupo.titulo}</h3>
              <div className={`flex flex-wrap justify-center rounded-2xl bg-gradient-to-b from-blue-50 to-slate-100 p-3 ${grupo.cartas.length > 4 ? 'gap-2' : 'gap-3'}`}>
                {grupo.cartas.map((carta, indice) => (
                  <Naipe key={`${carta.rango}-${carta.palo ?? carta.joker}-${indice}`} rango={carta.rango} palo={carta.palo} joker={carta.joker} tamano={grupo.cartas.length > 4 ? 'sm' : 'md'} />
                ))}
              </div>
              {grupo.nota && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">ℹ️ {grupo.nota}</p>}
              <dl className="flex flex-col gap-2 text-[13px] text-slate-700">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-azul">Valor individual</dt>
                  <dd>{grupo.valorIndividual}</dd>
                </div>
                {grupo.valorCanasta && (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-azul">Valor de canasta</dt>
                    <dd className="font-bold text-tinta">{grupo.valorCanasta}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-azul">Función</dt>
                  <dd>{grupo.funcion}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
