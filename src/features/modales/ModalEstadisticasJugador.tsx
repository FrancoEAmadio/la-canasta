import { useApp } from '../../estado/AppProvider';
import { calcularPorcentajeVictorias, calcularPorcentajeVictoriasModo, calcularPromedioPuntos } from '../../dominio/estadisticas';
import { formatearFecha } from '../../dominio/partida';
import { formatearPuntos } from '../../dominio/puntuacion';
import { AvatarJugador } from '../../ui/AvatarJugador';
import { EncabezadoModal, Modal } from '../../ui/Modal';

function Dato({ valor, etiqueta, destacado = false }: { valor: string | number; etiqueta: string; destacado?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${destacado ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
      <span className={`block text-2xl font-black ${destacado ? 'text-azul' : 'text-tinta'}`}>{valor}</span>
      <span className="block text-[10px] font-bold uppercase leading-tight text-slate-500">{etiqueta}</span>
    </div>
  );
}

export function ModalEstadisticasJugador() {
  const { jugadorViendoStats, cerrarEstadisticasJugador, jugadores } = useApp();
  // Se busca la versión más reciente de la tarjeta por si cambió mientras el modal estaba abierto.
  const jugador = jugadorViendoStats ? (jugadores.find((candidato) => candidato.id === jugadorViendoStats.id) ?? jugadorViendoStats) : null;

  return (
    <Modal abierto={!!jugador} onCerrar={cerrarEstadisticasJugador} ancho="max-w-md" zIndex="z-[60]" etiqueta="Perfil del jugador" cerrarAlHacerClickAfuera>
      {jugador && (
        <>
          <EncabezadoModal titulo={jugador.nombre} subtitulo="Perfil del jugador" onCerrar={cerrarEstadisticasJugador} />
          <div className="scroll-oculto flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="flex items-center gap-3">
              <AvatarJugador palo={jugador.palo} tamano="lg" />
              <div>
                <span className="block text-3xl font-black text-azul">{calcularPorcentajeVictorias(jugador)}%</span>
                <span className="text-[11px] font-bold uppercase text-slate-500">Win rate general</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Dato valor={jugador.estadisticas.partidasJugadas} etiqueta="Partidas jugadas" />
              <Dato valor={jugador.estadisticas.victorias} etiqueta="Partidas ganadas" destacado />
              <Dato valor={jugador.estadisticas.mejorPartida === null ? '—' : formatearPuntos(jugador.estadisticas.mejorPartida)} etiqueta="Récord de puntos" />
              <Dato valor={formatearPuntos(calcularPromedioPuntos(jugador))} etiqueta="Promedio por partida" />
              <Dato valor={jugador.estadisticas.canastasPuras} etiqueta="Canastas puras" destacado />
              <Dato valor={jugador.estadisticas.canastasImpuras} etiqueta="Canastas impuras" />
              <Dato valor={jugador.estadisticas.canastasComodines} etiqueta="Canastas de comodines" />
              <Dato valor={jugador.estadisticas.tresRojos} etiqueta="Tres Rojos" />
              <Dato valor={jugador.estadisticas.cierres} etiqueta="Rondas cerradas" />
              <Dato valor={jugador.estadisticas.cortesExactos} etiqueta="Cortes exactos" />
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-azul">Por modo de juego</h4>
              {(['individual', 'parejas'] as const).map((modo) => (
                <div key={modo} className="flex items-center justify-between border-b border-slate-100 py-1.5 text-sm last:border-none">
                  <span className="font-bold text-tinta">{modo === 'individual' ? '🙋 Individual' : '🤝 Parejas'}</span>
                  <span className="text-slate-600">
                    {jugador.estadisticas.porModo[modo].victorias}/{jugador.estadisticas.porModo[modo].jugadas} ·{' '}
                    <strong className="text-azul">{calcularPorcentajeVictoriasModo(jugador, modo)}%</strong>
                  </span>
                </div>
              ))}
            </div>

            {jugador.evolucion.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-3">
                <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-azul">Últimas partidas</h4>
                <ul className="flex flex-col gap-1">
                  {[...jugador.evolucion].reverse().slice(0, 8).map((entrada, indice) => (
                    <li key={`${entrada.fecha}-${indice}`} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{formatearFecha(entrada.fecha)}</span>
                      <span className="font-bold text-tinta">
                        {['🥇', '🥈', '🥉'][entrada.posicion - 1] ?? `${entrada.posicion}º`} · {formatearPuntos(entrada.puntos)} pts
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
