import { useMemo, useState } from 'react';
import { CATALOGO_CARTAS } from '../../datos/cartasDatos';
import { CATEGORIAS_REGLAS } from '../../datos/reglasDatos';
import { useApp } from '../../estado/AppProvider';
import { Naipe } from '../../ui/Naipe';

type Vista = 'reglas' | 'cartas';

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

  const grupos = useMemo(() => {
    const patron = normalizar(termino);
    if (!patron) return CATALOGO_CARTAS;
    return CATALOGO_CARTAS.filter((grupo) => {
      const texto = normalizar([grupo.titulo, grupo.valorIndividual, grupo.valorCanasta ?? '', grupo.funcion, grupo.nota ?? '', ...grupo.palabrasClave].join(' '));
      return texto.includes(patron);
    });
  }, [termino]);

  return (
    <main className="entrar flex w-full flex-col gap-4 py-5">
      <div className="flex flex-col gap-3">
        <button type="button" onClick={() => setPantallaActual('inicio')} className="btn-fantasma self-start px-3 py-2 text-sm">
          ← Volver al menú
        </button>
        <h2 className="font-display text-2xl font-black text-white">Manual, Cartas y Reglas</h2>

        <div className="grid grid-cols-2 gap-2" role="tablist">
          <button type="button" role="tab" aria-selected={vista === 'reglas'} onClick={() => setVista('reglas')} className={`${vista === 'reglas' ? 'btn-primario border-white/40' : 'btn-fantasma'} py-3 text-sm`}>
            📖 Reglas de Juego
          </button>
          <button type="button" role="tab" aria-selected={vista === 'cartas'} onClick={() => setVista('cartas')} className={`${vista === 'cartas' ? 'btn-primario border-white/40' : 'btn-fantasma'} py-3 text-sm`}>
            🃏 Catálogo de Cartas
          </button>
        </div>

        {vista === 'cartas' && (
          <div className="relative">
            <input
              value={termino}
              onChange={(evento) => setTermino(evento.target.value)}
              type="search"
              placeholder="🔍 Buscar carta (ej: K, joker, pozo)..."
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
        <div className="flex flex-col gap-2.5">
          {CATEGORIAS_REGLAS.map((categoria) => {
            const abierta = categoriaAbierta === categoria.id;
            return (
              <div key={categoria.id} className="tarjeta overflow-hidden">
                <button
                  type="button"
                  aria-expanded={abierta}
                  onClick={() => setCategoriaAbierta(abierta ? null : categoria.id)}
                  className={`flex w-full items-center justify-between p-4 text-left text-sm font-black ${abierta ? 'bg-azul text-white' : 'bg-white text-azul'}`}
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
                            className="flex w-full items-center justify-between py-1 text-left text-sm font-black text-tinta"
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
        <div className="flex flex-col gap-3">
          {grupos.length === 0 && <div className="tarjeta p-8 text-center text-sm text-slate-600">No hay cartas que coincidan con «{termino}».</div>}
          {grupos.map((grupo) => (
            <article key={grupo.id} className="tarjeta flex flex-col gap-3 p-4">
              <h3 className="font-display text-lg font-black text-azul">{grupo.titulo}</h3>
              <div className={`flex flex-wrap justify-center rounded-2xl bg-gradient-to-b from-blue-50 to-slate-100 p-3 ${grupo.cartas.length > 4 ? 'gap-2' : 'gap-3'}`}>
                {grupo.cartas.map((carta, indice) => (
                  <Naipe key={`${carta.rango}-${carta.palo ?? carta.joker}-${indice}`} rango={carta.rango} palo={carta.palo} joker={carta.joker} tamano={grupo.cartas.length > 4 ? 'sm' : 'md'} />
                ))}
              </div>
              {grupo.nota && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">ℹ️ {grupo.nota}</p>}
              <dl className="flex flex-col gap-2 text-[13px] text-slate-700">
                <div>
                  <dt className="text-[10px] font-black uppercase tracking-wider text-azul">Valor individual</dt>
                  <dd>{grupo.valorIndividual}</dd>
                </div>
                {grupo.valorCanasta && (
                  <div>
                    <dt className="text-[10px] font-black uppercase tracking-wider text-azul">Valor de canasta</dt>
                    <dd className="font-black text-tinta">{grupo.valorCanasta}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[10px] font-black uppercase tracking-wider text-azul">Función</dt>
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
