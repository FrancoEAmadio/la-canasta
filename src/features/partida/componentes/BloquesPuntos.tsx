import type { ReactNode } from 'react';
import { CONFIG_PUNTAJE } from '../../../constantes';
import { FIGURAS_ESTANDAR, formatearPuntos, puntosTresRojos, subtotalBloque1, subtotalBloque2, subtotalBloque3, subtotalBloque4, valorCanasta } from '../../../dominio/puntuacion';
import { maxCartas, maxTresNegros, maxTresRojos } from '../../../dominio/validaciones';
import { useApp } from '../../../estado/AppProvider';
import { ContadorMasMenos } from '../../../ui/ContadorMasMenos';
import { Toggle } from '../../../ui/Toggle';
import type { EntradaRonda, FiguraCanasta, Participante, Partida, TipoCanasta } from '../../../tipos';

interface PropsBloques {
  partida: Partida;
  participante: Participante;
  entrada: EntradaRonda;
}

function Bloque({ numero, titulo, subtotal, tono = 'azul', children }: { numero: number; titulo: string; subtotal: number; tono?: 'azul' | 'rojo'; children: ReactNode }) {
  const fondo = tono === 'rojo' ? 'bg-rojo-osc' : 'bg-azul';
  return (
    <section className={`tarjeta overflow-hidden ${tono === 'rojo' ? 'border-red-300' : ''}`}>
      <header className={`flex items-center justify-between gap-2 px-4 py-2.5 text-white ${fondo}`}>
        <h3 className="text-sm font-black leading-tight">
          <span className="mr-1.5 opacity-70">{numero}.</span>
          {titulo}
        </h3>
        <span className="rounded-full bg-white/20 px-2.5 py-1 text-sm font-black tabular-nums">{formatearPuntos(subtotal, true)}</span>
      </header>
      <div className="flex flex-col gap-3 p-4">{children}</div>
    </section>
  );
}

function FilaInterruptor({ titulo, detalle, activo, onCambiar, aviso }: { titulo: string; detalle: string; activo: boolean; onCambiar: (valor: boolean) => void; aviso?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="block text-sm font-black text-tinta">{titulo}</span>
          <span className="block text-xs font-semibold text-azul">{detalle}</span>
        </div>
        <Toggle etiqueta={titulo} checked={activo} onChange={onCambiar} />
      </div>
      {aviso && <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">{aviso}</p>}
    </div>
  );
}

function FilaContador({ titulo, ejemplo, unitario, valor, subtotal, max, tono = 'azul', deshabilitado, onCambiar }: {
  titulo: string;
  ejemplo: string;
  unitario: string;
  valor: number;
  subtotal: number;
  max: number;
  tono?: 'azul' | 'rojo';
  deshabilitado?: boolean;
  onCambiar: (nuevo: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 last:border-none last:pb-0">
      <div className="min-w-0">
        <span className="block text-sm font-black leading-tight text-tinta">{titulo}</span>
        <span className="block text-[11px] font-semibold text-slate-500">{ejemplo}</span>
        <span className={`mt-0.5 block text-xs font-black tabular-nums ${tono === 'rojo' ? 'text-rojo-osc' : 'text-azul'}`}>
          {unitario} · {formatearPuntos(subtotal, true)} pts
        </span>
      </div>
      <ContadorMasMenos valor={valor} onCambiar={onCambiar} max={max} tono={tono} etiqueta={titulo} deshabilitado={deshabilitado} />
    </div>
  );
}

// ───────────── Bloque 1: bonificaciones ─────────────
export function BloqueBonificaciones({ partida, participante, entrada }: PropsBloques) {
  const { partida: estado } = useApp();
  const { borrador } = partida;
  const otroCon = (clave: 'corteExacto' | 'cerro') =>
    partida.participantes.find((otro) => otro.id !== participante.id && borrador.entradas[otro.id]?.[clave])?.nombre;
  const avisoExclusivo = (clave: 'corteExacto' | 'cerro', texto: string) => {
    const otro = otroCon(clave);
    return otro && !entrada[clave] ? `${texto} ${otro}. Si lo activás acá, se lo sacás.` : undefined;
  };

  return (
    <Bloque numero={1} titulo="Bonificaciones de ronda" subtotal={subtotalBloque1(entrada)}>
      <FilaInterruptor
        titulo="¿Corte exacto en el reparto?"
        detalle={`+${CONFIG_PUNTAJE.bonoCorteExacto} pts · al repartir, el corte salió justo`}
        activo={entrada.corteExacto}
        onCambiar={() => estado.alternarBonoExclusivo('corteExacto', participante.id)}
        aviso={avisoExclusivo('corteExacto', 'Ya lo tiene')}
      />
      <FilaInterruptor
        titulo="¿Cerró / cortó la ronda?"
        detalle={`+${CONFIG_PUNTAJE.bonoCierre} pts · se quedó sin cartas (solo uno por ronda)`}
        activo={entrada.cerro}
        onCambiar={() => estado.alternarBonoExclusivo('cerro', participante.id)}
        aviso={avisoExclusivo('cerro', 'Ya cerró')}
      />
      <FilaContador
        titulo="Tres Rojos (3♥ 3♦)"
        ejemplo={`1 = +100 · 2 = +200 · 3 = +300 · los 4 = +500${partida.reglas.mazos > 2 ? ` · cada extra +${CONFIG_PUNTAJE.tresRojoExtra}` : ''}`}
        unitario={`${entrada.tresRojos} de ${2 * partida.reglas.mazos}`}
        valor={entrada.tresRojos}
        subtotal={puntosTresRojos(entrada.tresRojos)}
        max={maxTresRojos(borrador.entradas, participante.id, partida.reglas.mazos)}
        onCambiar={(nuevo) => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, tresRojos: nuevo }))}
      />
    </Bloque>
  );
}

// ───────────── Bloque 2: canastas ─────────────
const OPCIONES_CANASTA: { tipo: TipoCanasta; etiqueta: string }[] = [
  { tipo: 'ninguna', etiqueta: 'Ninguna' },
  { tipo: 'pura', etiqueta: 'Pura' },
  { tipo: 'impura', etiqueta: 'Impura' },
];

const TONO_TIPO: Record<TipoCanasta, string> = { ninguna: 'tono-neutro', pura: 'tono-pura', impura: 'tono-impura' };

function FilaCanasta({ figura, tipo, onCambiar }: { figura: FiguraCanasta; tipo: TipoCanasta; onCambiar: (tipo: TipoCanasta) => void }) {
  const nombre = figura === 'A' ? 'Ases' : figura;
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-slate-200 bg-slate-50 font-display text-lg font-black text-azul" aria-hidden="true">
        {figura}
      </span>
      <div className="seg grid-cols-3 flex-1" role="group" aria-label={`Canasta de ${nombre}`}>
        {OPCIONES_CANASTA.map((opcion) => (
          <button key={opcion.tipo} type="button" aria-pressed={tipo === opcion.tipo} onClick={() => onCambiar(opcion.tipo)} className={`seg-btn ${TONO_TIPO[opcion.tipo]}`}>
            {opcion.etiqueta}
            {opcion.tipo !== 'ninguna' && <span className="block text-[10px] font-bold opacity-85">+{valorCanasta(figura, opcion.tipo).toLocaleString('es-AR')}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BloqueCanastas({ participante, entrada }: PropsBloques) {
  const { partida: estado } = useApp();
  const cambiar = (figura: FiguraCanasta, tipo: TipoCanasta) =>
    estado.modificarEntrada(participante.id, (actual) => ({ ...actual, canastas: { ...actual.canastas, [figura]: tipo } }));

  return (
    <Bloque numero={2} titulo="Canastas (máx. 1 por figura)" subtotal={subtotalBloque2(entrada)}>
      <FilaCanasta figura="A" tipo={entrada.canastas.A} onCambiar={(tipo) => cambiar('A', tipo)} />

      <div className="flex items-center gap-2.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-slate-200 bg-slate-50 text-xs font-black leading-tight text-azul" aria-hidden="true">
          2 y
          <br />
          🃏
        </span>
        <div className="seg grid-cols-2 flex-1" role="group" aria-label="Canasta de Comodines">
          <button type="button" aria-pressed={!entrada.canastaComodines} onClick={() => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, canastaComodines: false }))} className="seg-btn tono-neutro">
            Ninguna
          </button>
          <button type="button" aria-pressed={entrada.canastaComodines} onClick={() => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, canastaComodines: true }))} className="seg-btn tono-pura">
            Comodines
            <span className="block text-[10px] font-bold opacity-85">+{CONFIG_PUNTAJE.canastaComodines.toLocaleString('es-AR')}</span>
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-200" />
      {FIGURAS_ESTANDAR.map((figura) => (
        <FilaCanasta key={figura} figura={figura} tipo={entrada.canastas[figura]} onCambiar={(tipo) => cambiar(figura, tipo)} />
      ))}
    </Bloque>
  );
}

// ───────────── Bloque 3: cartas en mesa ─────────────
export function BloqueCartasMesa({ partida, participante, entrada }: PropsBloques) {
  const { partida: estado } = useApp();
  const { entradas } = partida.borrador;
  const v = CONFIG_PUNTAJE.valorCarta;
  const filas = [
    { clave: 'c5', titulo: 'Cartas de 5 puntos', ejemplo: '4, 5, 6 y 7', unitario: v.c5 },
    { clave: 'c10', titulo: 'Cartas de 10 puntos', ejemplo: '8, 9, 10, J, Q y K', unitario: v.c10 },
    { clave: 'c20', titulo: 'Cartas de 20 puntos', ejemplo: 'Ases y los 2', unitario: v.c20 },
    { clave: 'c50', titulo: 'Jokers', ejemplo: 'Comodines de 50', unitario: v.c50 },
  ] as const;

  return (
    <Bloque numero={3} titulo="Cartas en la mesa (a favor)" subtotal={subtotalBloque3(entrada)}>
      {filas.map((fila) => (
        <FilaContador
          key={fila.clave}
          titulo={fila.titulo}
          ejemplo={fila.ejemplo}
          unitario={`×${fila.unitario}`}
          valor={entrada.cartasMesa[fila.clave]}
          subtotal={entrada.cartasMesa[fila.clave] * fila.unitario}
          max={maxCartas(entradas, participante.id, 'mesa', fila.clave, partida.reglas.mazos)}
          onCambiar={(nuevo) => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, cartasMesa: { ...actual.cartasMesa, [fila.clave]: nuevo } }))}
        />
      ))}
    </Bloque>
  );
}

// ───────────── Bloque 4: cartas en mano (puntos negativos) ─────────────
export function BloqueCartasMano({ partida, participante, entrada }: PropsBloques) {
  const { partida: estado } = useApp();
  const { entradas } = partida.borrador;
  const v = CONFIG_PUNTAJE.valorCarta;
  const sinCartas = partida.modo === 'individual' && entrada.cerro;
  const filas = [
    { clave: 'c5', titulo: 'Cartas de 5 en mano', ejemplo: '4 al 7', unitario: v.c5 },
    { clave: 'c10', titulo: 'Cartas de 10 en mano', ejemplo: '8 al K', unitario: v.c10 },
    { clave: 'c20', titulo: 'Cartas de 20 en mano', ejemplo: 'Ases y los 2', unitario: v.c20 },
    { clave: 'c50', titulo: 'Jokers en mano', ejemplo: 'Comodines de 50', unitario: v.c50 },
  ] as const;

  return (
    <Bloque numero={4} titulo="Cartas que quedaron en la mano" subtotal={subtotalBloque4(entrada)} tono="rojo">
      {sinCartas && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-rojo-osc">Cerró la ronda: se quedó sin cartas, así que no resta nada.</p>}
      {partida.modo === 'parejas' && <p className="text-[11px] font-semibold text-slate-500">Sumá las cartas que les quedaron a los dos integrantes del equipo.</p>}
      <FilaContador
        titulo="Tres Negros en mano (3♠ 3♣)"
        ejemplo="Sanción grave por no descartarlos"
        unitario={`×−${CONFIG_PUNTAJE.penalidadTresNegro}`}
        valor={entrada.cartasMano.tresNegros}
        subtotal={-entrada.cartasMano.tresNegros * CONFIG_PUNTAJE.penalidadTresNegro}
        max={maxTresNegros(entradas, participante.id, partida.reglas.mazos)}
        tono="rojo"
        deshabilitado={sinCartas}
        onCambiar={(nuevo) => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, cartasMano: { ...actual.cartasMano, tresNegros: nuevo } }))}
      />
      {filas.map((fila) => (
        <FilaContador
          key={fila.clave}
          titulo={fila.titulo}
          ejemplo={fila.ejemplo}
          unitario={`×−${fila.unitario}`}
          valor={entrada.cartasMano[fila.clave]}
          subtotal={-entrada.cartasMano[fila.clave] * fila.unitario}
          max={maxCartas(entradas, participante.id, 'mano', fila.clave, partida.reglas.mazos)}
          tono="rojo"
          deshabilitado={sinCartas}
          onCambiar={(nuevo) => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, cartasMano: { ...actual.cartasMano, [fila.clave]: nuevo } }))}
        />
      ))}
    </Bloque>
  );
}
