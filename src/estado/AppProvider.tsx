import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { cargarAjustes, guardarAjustes } from '../infra/almacenamiento';
import { configurarVibracion } from '../infra/vibracion';
import { useJugadoresPermanentes } from '../features/jugadores/useJugadoresPermanentes';
import type { ResultadoCrear } from '../features/jugadores/useJugadoresPermanentes';
import { usePartidaState } from '../features/partida/usePartidaState';
import type { PartidaState } from '../features/partida/usePartidaState';
import type { Ajustes, JugadorPermanente, PantallaId, Palo, Partida } from '../tipos';

interface ContextoApp {
  pantallaActual: PantallaId;
  setPantallaActual: (pantalla: PantallaId) => void;

  jugadores: JugadorPermanente[];
  crearJugador: (nombre: string, palo?: Palo) => ResultadoCrear;
  editarJugador: (id: string, nombre: string, palo: Palo) => 'ok' | 'vacio' | 'duplicado';
  eliminarJugador: (id: string) => void;
  reemplazarJugadores: (lista: JugadorPermanente[]) => void;

  partida: PartidaState;

  ajustes: Ajustes;
  cambiarAjustes: (parcial: Partial<Ajustes>) => void;

  /** Partida cuyo podio (tabla general) se está mostrando. */
  podioPartidaId: string | null;
  abrirPodio: (partidaId?: string) => void;
  cerrarPodio: () => void;

  menuPartidaAbierto: boolean;
  setMenuPartidaAbierto: (abierto: boolean) => void;


  ajustesAbiertos: boolean;
  setAjustesAbiertos: (abierto: boolean) => void;

  auditoria: { partida: Partida; participanteId: string } | null;
  verAuditoria: (partida: Partida, participanteId: string) => void;
  cerrarAuditoria: () => void;

  jugadorViendoStats: JugadorPermanente | null;
  verEstadisticasJugador: (jugador: JugadorPermanente) => void;
  cerrarEstadisticasJugador: () => void;

  errorGuardado: boolean;
  descartarErrorGuardado: () => void;
}

const AppContext = createContext<ContextoApp | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [pantallaActual, setPantallaActual] = useState<PantallaId>('inicio');
  const [ajustes, setAjustes] = useState<Ajustes>(cargarAjustes);
  const [podioPartidaId, setPodioPartidaId] = useState<string | null>(null);
  const [menuPartidaAbierto, setMenuPartidaAbierto] = useState(false);
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false);
  const [auditoria, setAuditoria] = useState<{ partida: Partida; participanteId: string } | null>(null);
  const [jugadorViendoStats, setJugadorViendoStats] = useState<JugadorPermanente | null>(null);
  const [errorGuardado, setErrorGuardado] = useState(false);

  const alErrorGuardado = useCallback(() => setErrorGuardado(true), []);

  const { jugadores, crear, editar, eliminar, reemplazarLista, obtenerLista } = useJugadoresPermanentes(alErrorGuardado);

  const partida = usePartidaState({
    setPantallaActual,
    obtenerJugadores: obtenerLista,
    reemplazarJugadores: reemplazarLista,
    alErrorGuardado,
  });

  useEffect(() => {
    configurarVibracion(ajustes.vibracion);
  }, [ajustes.vibracion]);

  const cambiarAjustes = useCallback(
    (parcial: Partial<Ajustes>) => {
      setAjustes((actuales) => {
        const nuevos = { ...actuales, ...parcial };
        if (!guardarAjustes(nuevos)) alErrorGuardado();
        return nuevos;
      });
    },
    [alErrorGuardado]
  );

  const abrirPodio = useCallback(
    (partidaId?: string) => {
      const id = partidaId ?? partida.activaId;
      if (id) setPodioPartidaId(id);
    },
    [partida.activaId]
  );

  const { soltarPartidaActiva } = partida;
  const cerrarPodio = useCallback(() => {
    const finalizada = partida.partidas.find((candidata) => candidata.id === podioPartidaId)?.estado === 'finalizada';
    setPodioPartidaId(null);
    if (finalizada && pantallaActual === 'partida') {
      soltarPartidaActiva();
      setPantallaActual('inicio');
    }
  }, [partida.partidas, podioPartidaId, pantallaActual, soltarPartidaActiva]);

  const valor = useMemo<ContextoApp>(
    () => ({
      pantallaActual,
      setPantallaActual,
      jugadores,
      crearJugador: crear,
      editarJugador: editar,
      eliminarJugador: eliminar,
      reemplazarJugadores: reemplazarLista,
      partida,
      ajustes,
      cambiarAjustes,
      podioPartidaId,
      abrirPodio,
      cerrarPodio,
      menuPartidaAbierto,
      setMenuPartidaAbierto,
      ajustesAbiertos,
      setAjustesAbiertos,
      auditoria,
      verAuditoria: (p, participanteId) => setAuditoria({ partida: p, participanteId }),
      cerrarAuditoria: () => setAuditoria(null),
      jugadorViendoStats,
      verEstadisticasJugador: setJugadorViendoStats,
      cerrarEstadisticasJugador: () => setJugadorViendoStats(null),
      errorGuardado,
      descartarErrorGuardado: () => setErrorGuardado(false),
    }),
    [
      pantallaActual,
      jugadores,
      crear,
      editar,
      eliminar,
      reemplazarLista,
      partida,
      ajustes,
      cambiarAjustes,
      podioPartidaId,
      abrirPodio,
      cerrarPodio,
      menuPartidaAbierto,
      ajustesAbiertos,
      auditoria,
      jugadorViendoStats,
      errorGuardado,
    ]
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp(): ContextoApp {
  const contexto = useContext(AppContext);
  if (!contexto) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return contexto;
}
