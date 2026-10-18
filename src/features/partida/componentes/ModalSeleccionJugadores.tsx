import { useMemo, useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { calcularPorcentajeVictorias } from '../../../dominio/estadisticas';
import { AvatarJugador } from '../../../ui/AvatarJugador';
import { EncabezadoModal, Modal } from '../../../ui/Modal';
import { SelectorPalo } from '../../../ui/SelectorPalo';
import type { Palo } from '../../../tipos';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  /** IDs elegidos, en orden de selección. */
  seleccionados: string[];
  maximo?: number;
  /** Jugadores que no se pueden tocar (ya están en otro casillero). */
  excluidos?: string[];
  /** Modo "elegir uno": al tocar un jugador se elige y se cierra. */
  unico?: boolean;
  onElegir: (id: string) => void;
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
    .trim();
}

export function ModalSeleccionJugadores({ abierto, onCerrar, titulo, seleccionados, maximo, excluidos = [], unico = false, onElegir }: Props) {
  const { jugadores, crearJugador } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [paloNuevo, setPaloNuevo] = useState<Palo>('picas');
  const [error, setError] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const patron = normalizar(busqueda);
    return patron ? jugadores.filter((jugador) => normalizar(jugador.nombre).includes(patron)) : jugadores;
  }, [busqueda, jugadores]);

  const cerrar = () => {
    setBusqueda('');
    setError(null);
    onCerrar();
  };

  const crear = () => {
    const resultado = crearJugador(nombreNuevo, paloNuevo);
    if (!resultado.ok) {
      setError(resultado.motivo === 'duplicado' ? 'Ya existe un jugador con ese nombre.' : 'Escribí un nombre.');
      return;
    }
    setError(null);
    setNombreNuevo('');
    setBusqueda('');
    onElegir(resultado.jugador.id);
    if (unico) cerrar();
  };

  const tocar = (id: string) => {
    onElegir(id);
    if (unico) cerrar();
  };

  return (
    <Modal abierto={abierto} onCerrar={cerrar} ancho="max-w-md" etiqueta={titulo} cerrarAlHacerClickAfuera>
      <EncabezadoModal
        titulo={titulo}
        subtitulo={unico ? 'Tocá una tarjeta para elegirla' : `${seleccionados.length}${maximo ? ` de ${maximo}` : ''} seleccionados`}
        onCerrar={cerrar}
      />

      <div className="scroll-oculto flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <input
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          type="search"
          placeholder="🔍 Buscar jugador..."
          aria-label="Buscar jugador por nombre"
          className="campo"
        />

        <form
          className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3"
          onSubmit={(evento) => {
            evento.preventDefault();
            crear();
          }}
        >
          <span className="text-[11px] font-black uppercase tracking-wider text-azul">Crear jugador nuevo</span>
          <div className="flex gap-2">
            <input
              value={nombreNuevo}
              onChange={(evento) => setNombreNuevo(evento.target.value)}
              type="text"
              maxLength={24}
              placeholder="Nombre..."
              aria-label="Nombre del jugador nuevo"
              className="campo min-w-0 flex-1"
            />
            <button type="submit" className="btn-primario px-4 text-sm">
              + Crear
            </button>
          </div>
          <SelectorPalo valor={paloNuevo} onCambiar={setPaloNuevo} />
          {error && <span className="text-xs font-bold text-rojo-osc">{error}</span>}
        </form>

        {filtrados.length > 0 ? (
          <div className="flex flex-col gap-2">
            {filtrados.map((jugador) => {
              const posicion = seleccionados.indexOf(jugador.id);
              const elegido = posicion >= 0;
              const bloqueado = excluidos.includes(jugador.id);
              const lleno = !unico && !elegido && maximo !== undefined && seleccionados.length >= maximo;
              return (
                <button
                  key={jugador.id}
                  type="button"
                  disabled={bloqueado || lleno}
                  aria-pressed={elegido}
                  onClick={() => tocar(jugador.id)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left disabled:opacity-40 ${
                    elegido ? 'border-azul-vivo bg-blue-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <AvatarJugador palo={jugador.palo} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-black text-tinta">{jugador.nombre}</span>
                    <span className="block text-[11px] font-semibold text-slate-500">
                      {bloqueado
                        ? 'Ya está en otro lugar'
                        : `${jugador.estadisticas.partidasJugadas} partidas · ${calcularPorcentajeVictorias(jugador)}% victorias`}
                    </span>
                  </span>
                  {elegido && !unico && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-azul-vivo text-sm font-black text-white">
                      {posicion + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-600">
            {jugadores.length === 0 ? 'Todavía no hay jugadores. Creá el primero arriba.' : 'No hay jugadores que coincidan con la búsqueda.'}
          </p>
        )}
      </div>

      {!unico && (
        <div className="border-t border-slate-200 p-4">
          <button type="button" onClick={cerrar} className="btn-primario w-full py-3.5 text-base">
            Listo ({seleccionados.length})
          </button>
        </div>
      )}
    </Modal>
  );
}
