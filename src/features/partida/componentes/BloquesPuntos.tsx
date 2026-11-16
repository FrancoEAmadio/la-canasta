import type { ReactNode } from 'react';
import { CONFIG_PUNTAJE } from '../../../constantes';
import { FIGURAS_ESTANDAR, formatearPuntos, puntosTresRojos, subtotalBloque1, subtotalBloque2, subtotalBloque3, subtotalBloque4, valorCanasta } from '../../../dominio/puntuacion';
import { maxCartas, maxTresNegros, maxTresRojos } from '../../../dominio/validaciones';
import { useApp } from '../../../estado/AppProvider';
import { vibrar, vibrarBorrado } from '../../../infra/vibracion';
import { ChipBono } from '../../../ui/ChipBono';
import { CampoCantidad } from '../../../ui/CampoCantidad';
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
        <h3 className="text-sm font-bold leading-tight">
          <span className="mr-1.5 opacity-70">{numero}.</span>
          {titulo}
        </h3>
        <span className="rounded-full bg-white/20 px-2.5 py-1 text-sm font-bold tabular-nums">{formatearPuntos(subtotal, true)}</span>
      </header>
      <div className="flex flex-col gap-3 p-4">{children}</div>
    </section>
  );
}

function BotonLimpiar({ visible, onLimpiar, texto = 'Limpiar' }: { visible: boolean; onLimpiar: () => void; texto?: string }) {
  if (!visible) return null;
  return (
    <button type="button" onClick={() => { vibrarBorrado(); onLimpiar(); }} className="btn-peligro mx-auto px-5 py-2.5 text-sm">
      {texto}
    </button>
  );
}

function FilaCantidad({ titulo, ejemplo, valorCarta, valor, max, tono = 'azul', deshabilitado, onCambiar }: {
  titulo: string;
  ejemplo: string;
  valorCarta: number;
  valor: number;
  max: number;
  tono?: 'azul' | 'rojo';
  deshabilitado?: boolean;
  onCambiar: (nuevo: number) => void;
}) {
  const signo = tono === 'rojo' ? '−' : '+';
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-none last:pb-0">
      <div className="min-w-0 flex-1 pt-0.5">
        <span className="block text-sm font-bold leading-tight text-tinta">{titulo}</span>
        <span className="block text-[11px] font-semibold text-slate-500">{ejemplo}</span>
        <span className={`mt-0.5 block text-xs font-bold tabular-nums ${tono === 'rojo' ? 'text-rojo-osc' : 'text-azul'}`}>
          {valor} {valor === 1 ? 'carta' : 'cartas'} × {valorCarta} = {valor > 0 ? signo : ""}{(valor * valorCarta).toLocaleString('es-AR')} pts
        </span>
      </div>
      <CampoCantidad valor={valor} onCambiar={onCambiar} max={max} tono={tono} etiqueta={titulo} deshabilitado={deshabilitado} />
    </div>
  );
}

// ───────────── Bloque 1: bonificaciones ─────────────
export function BloqueBonificaciones({ partida, participante, entrada }: PropsBloques) {
  const { partida: estado } = useApp();
  const { borrador } = partida;
  const otroCon = (clave: 'corteExacto' | 'cerro') =>
    partida.participantes.find((otro) => otro.id !== participante.id && borrador.entradas[otro.id]?.[clave])?.nombre;
  const aviso = (clave: 'corteExacto' | 'cerro') => {
    const otro = otroCon(clave);
    return otro && !entrada[clave] ? `Lo tiene ${otro}` : undefined;
  };
  const maxRojos = maxTresRojos(borrador.entradas, participante.id, partida.reglas.mazos);
  const cambiarRojos = (nuevo: number) => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, tresRojos: nuevo }));
  const cambiarEspejito = (valor: boolean) => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, espejito: valor }));

  return (
    <Bloque numero={1} titulo="Bonificaciones de ronda" subtotal={subtotalBloque1(entrada)}>
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <ChipBono
          titulo="Cerró la ronda"
          tono="verde"
          puntos={`+${CONFIG_PUNTAJE.bonoCierre} pts`}
          cantidad={entrada.cerro ? 1 : 0}
          maximo={1}
          aviso={aviso('cerro')}
          onMas={() => estado.alternarBonoExclusivo('cerro', participante.id)}
          onBorrar={() => estado.alternarBonoExclusivo('cerro', participante.id)}
        />
        <ChipBono
          titulo="Corte exacto"
          tono="amarillo"
          puntos={`+${CONFIG_PUNTAJE.bonoCorteExacto} pts`}
          cantidad={entrada.corteExacto ? 1 : 0}
          maximo={1}
          aviso={aviso('corteExacto')}
          onMas={() => estado.alternarBonoExclusivo('corteExacto', participante.id)}
          onBorrar={() => estado.alternarBonoExclusivo('corteExacto', participante.id)}
        />
        <ChipBono
          titulo="Espejito"
          puntos={`+${CONFIG_PUNTAJE.bonoEspejito} pts`}
          cantidad={entrada.espejito ? 1 : 0}
          maximo={1}
          onMas={() => cambiarEspejito(true)}
          onBorrar={() => cambiarEspejito(false)}
        />
        <ChipBono
          titulo="Tres Rojos"
          tono="rojo"
          puntos={entrada.tresRojos > 0 ? `+${puntosTresRojos(entrada.tresRojos).toLocaleString('es-AR')} pts` : `hasta ${maxRojos}`}
          cantidad={entrada.tresRojos}
          maximo={maxRojos}
          onMas={() => cambiarRojos(entrada.tresRojos + 1)}
          onBorrar={() => cambiarRojos(0)}
        />
      </div>
    </Bloque>
  );
}

// ───────────── Bloque 2: canastas ─────────────
/** Cada toque pasa a la siguiente: nada → Pura → Impura → nada. */
const SIGUIENTE_TIPO: Record<TipoCanasta, TipoCanasta> = { ninguna: 'pura', pura: 'impura', impura: 'ninguna' };

const ESTILO_TIPO: Record<TipoCanasta, string> = {
  ninguna: 'border-slate-200 bg-slate-50 text-slate-400',
  pura: 'border-azul-vivo bg-blue-50 text-azul ring-2 ring-blue-200',
  impura: 'border-rojo bg-red-50 text-rojo-osc ring-2 ring-red-200',
};

function FichaCanasta({ figura, tipo, puntos, etiqueta, onTocar }: { figura: string; tipo: TipoCanasta; puntos: number; etiqueta: string; onTocar: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Canasta de ${etiqueta}: ${tipo === 'ninguna' ? 'ninguna' : tipo}`}
      onClick={() => {
        if (tipo === 'impura') vibrarBorrado();
        else vibrar();
        onTocar();
      }}
      className={`flex min-h-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1 py-1.5 text-center active:scale-95 ${ESTILO_TIPO[tipo]}`}
    >
      <span className={`font-display text-xl font-bold leading-none ${tipo === 'ninguna' ? 'text-azul' : ''}`}>{figura}</span>
      <span className="text-[10px] font-bold uppercase leading-tight">{tipo === 'ninguna' ? '—' : tipo}</span>
      {tipo !== 'ninguna' && <span className="text-[10px] font-bold tabular-nums leading-tight">+{puntos.toLocaleString('es-AR')}</span>}
    </button>
  );
}

export function BloqueCanastas({ participante, entrada }: PropsBloques) {
  const { partida: estado } = useApp();
  const cambiar = (figura: FiguraCanasta, tipo: TipoCanasta) =>
    estado.modificarEntrada(participante.id, (actual) => ({ ...actual, canastas: { ...actual.canastas, [figura]: tipo } }));
  const hayCanastas = entrada.canastaComodines || Object.values(entrada.canastas).some((tipo) => tipo !== 'ninguna');
  const figuras: FiguraCanasta[] = ['A', ...FIGURAS_ESTANDAR];

  return (
    <Bloque numero={2} titulo="Canastas (máximo 1 por equipo o jugador)" subtotal={subtotalBloque2(entrada)}>
      <p className="text-[11px] font-semibold leading-snug text-slate-500">
        Tocá el número: <strong className="text-azul">1 vez = Pura</strong>, <strong className="text-rojo-osc">2 = Impura</strong>, 3 = sin canasta.
      </p>
      <div className="grid grid-cols-4 gap-2">
        {figuras.slice(0, 1).map((figura) => (
          <FichaCanasta key={figura} figura={figura} etiqueta="Ases" tipo={entrada.canastas[figura]} puntos={valorCanasta(figura, entrada.canastas[figura])} onTocar={() => cambiar(figura, SIGUIENTE_TIPO[entrada.canastas[figura]])} />
        ))}
        <button
          type="button"
          aria-pressed={entrada.canastaComodines}
          aria-label="Canasta de Comodines"
          onClick={() => {
            if (entrada.canastaComodines) vibrarBorrado();
            else vibrar();
            estado.modificarEntrada(participante.id, (actual) => ({ ...actual, canastaComodines: !actual.canastaComodines }));
          }}
          className={`flex min-h-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1 py-1.5 text-center active:scale-95 ${entrada.canastaComodines ? 'border-slate-900 bg-slate-100 text-slate-900 ring-2 ring-slate-400' : ESTILO_TIPO.ninguna}`}
        >
          <span className={`font-display text-xl font-bold leading-none ${entrada.canastaComodines ? '' : 'text-azul'}`}>🃏</span>
          <span className="text-[10px] font-bold uppercase leading-tight">{entrada.canastaComodines ? 'Comodín' : '—'}</span>
          {entrada.canastaComodines && <span className="text-[10px] font-bold tabular-nums leading-tight">+{CONFIG_PUNTAJE.canastaComodines.toLocaleString('es-AR')}</span>}
        </button>
        {figuras.slice(1).map((figura) => (
          <FichaCanasta key={figura} figura={figura} etiqueta={figura} tipo={entrada.canastas[figura]} puntos={valorCanasta(figura, entrada.canastas[figura])} onTocar={() => cambiar(figura, SIGUIENTE_TIPO[entrada.canastas[figura]])} />
        ))}
      </div>
      <BotonLimpiar
        visible={hayCanastas}
        texto="Limpiar canastas"
        onLimpiar={() =>
          estado.modificarEntrada(participante.id, (actual) => ({
            ...actual,
            canastaComodines: false,
            canastas: Object.fromEntries(Object.keys(actual.canastas).map((figura) => [figura, 'ninguna'])) as EntradaRonda['canastas'],
          }))
        }
      />
    </Bloque>
  );
}

// ───────────── Bloques 3 y 4: cartas en la mesa / en la mano ─────────────
const FILAS_CARTAS = [
  { clave: 'c5', titulo: 'Cartas de 5 puntos', ejemplo: '4, 5, 6 y 7' },
  { clave: 'c10', titulo: 'Cartas de 10 puntos', ejemplo: '8, 9, 10, J, Q y K' },
  { clave: 'c20', titulo: 'Cartas de 20 puntos', ejemplo: 'Ases y los dos' },
  { clave: 'c50', titulo: 'Jokers', ejemplo: 'Comodines de 50 puntos' },
] as const;

const AYUDA_CONTEO = 'Escribí cuántas cartas hay de cada tipo (no los puntos): la app hace la cuenta.';

export function BloqueCartasMesa({ partida, participante, entrada }: PropsBloques) {
  const { partida: estado } = useApp();
  const { entradas } = partida.borrador;
  const v = CONFIG_PUNTAJE.valorCarta;
  const hayCartas = FILAS_CARTAS.some((fila) => entrada.cartasMesa[fila.clave] > 0);

  return (
    <Bloque numero={3} titulo="Cartas en la mesa (a favor)" subtotal={subtotalBloque3(entrada)}>
      <p className="text-[11px] font-semibold leading-snug text-slate-500">{AYUDA_CONTEO}</p>
      <div className="flex flex-col gap-3">
        {FILAS_CARTAS.map((fila) => (
          <FilaCantidad
            key={fila.clave}
            valorCarta={v[fila.clave]}
            titulo={fila.titulo}
            ejemplo={fila.ejemplo}
            valor={entrada.cartasMesa[fila.clave]}
            max={maxCartas(entradas, participante.id, 'mesa', fila.clave, partida.reglas.mazos)}
            onCambiar={(nuevo) => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, cartasMesa: { ...actual.cartasMesa, [fila.clave]: nuevo } }))}
          />
        ))}
      </div>
      <BotonLimpiar
        visible={hayCartas}
        texto="Limpiar cartas de la mesa"
        onLimpiar={() => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, cartasMesa: { c5: 0, c10: 0, c20: 0, c50: 0 } }))}
      />
    </Bloque>
  );
}

export function BloqueCartasMano({ partida, participante, entrada }: PropsBloques) {
  const { partida: estado } = useApp();
  const { entradas } = partida.borrador;
  const v = CONFIG_PUNTAJE.valorCarta;
  const sinCartas = partida.modo === 'individual' && entrada.cerro;
  const hayCartas = entrada.cartasMano.tresNegros > 0 || FILAS_CARTAS.some((fila) => entrada.cartasMano[fila.clave] > 0);
  const maxNegros = maxTresNegros(entradas, participante.id, partida.reglas.mazos);
  const cambiarNegros = (nuevo: number) => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, cartasMano: { ...actual.cartasMano, tresNegros: nuevo } }));

  return (
    <Bloque numero={4} titulo="Cartas que quedaron en la mano" subtotal={subtotalBloque4(entrada)} tono="rojo">
      {sinCartas ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-rojo-osc">Cerró la ronda: se quedó sin cartas, así que no resta nada.</p>
      ) : (
        <p className="text-[11px] font-semibold leading-snug text-slate-500">
          {partida.modo === 'parejas' ? 'Contá las cartas que les quedaron a los dos integrantes. ' : ''}
          {AYUDA_CONTEO}
        </p>
      )}
      {!sinCartas && (
      <div className="flex flex-col gap-3">
        <FilaCantidad
          titulo="Tres Negros en mano (3♠ 3♣)"
          ejemplo="Sanción por no descartarlos"
          valorCarta={CONFIG_PUNTAJE.penalidadTresNegro}
          valor={entrada.cartasMano.tresNegros}
          max={maxNegros}
          tono="rojo"
          deshabilitado={sinCartas}
          onCambiar={cambiarNegros}
        />
        {FILAS_CARTAS.map((fila) => (
          <FilaCantidad
            key={fila.clave}
            valorCarta={v[fila.clave]}
            titulo={fila.titulo.replace('Jokers', 'Jokers en mano').replace(' puntos', ' en mano')}
            ejemplo={fila.ejemplo}
            tono="rojo"
            deshabilitado={sinCartas}
            valor={entrada.cartasMano[fila.clave]}
            max={maxCartas(entradas, participante.id, 'mano', fila.clave, partida.reglas.mazos)}
            onCambiar={(nuevo) => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, cartasMano: { ...actual.cartasMano, [fila.clave]: nuevo } }))}
          />
        ))}
      </div>
      )}
      <BotonLimpiar
        visible={hayCartas && !sinCartas}
        texto="Limpiar cartas de la mano"
        onLimpiar={() => estado.modificarEntrada(participante.id, (actual) => ({ ...actual, cartasMano: { c5: 0, c10: 0, c20: 0, c50: 0, tresNegros: 0 } }))}
      />
    </Bloque>
  );
}
