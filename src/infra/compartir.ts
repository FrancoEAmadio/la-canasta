import {
  calcularRanking,
  formatearFecha,
  nombreCompletoParticipante,
} from '../dominio/partida.ts';
import { formatearPuntos } from '../dominio/puntuacion.ts';
import type { Partida } from '../tipos/index.ts';

const MEDALLAS = ['🥇', '🥈', '🥉'];

export function textoResultado(partida: Partida): string {
  const ranking = calcularRanking(partida);
  const lineas = ranking.map((fila) => {
    const medalla = MEDALLAS[fila.posicion - 1] ?? `${fila.posicion}.`;
    return `${medalla} ${nombreCompletoParticipante(fila.participante)} — ${formatearPuntos(fila.puntos)} pts`;
  });
  const meta = partida.objetivo === null ? 'sin límite de puntos' : `a ${partida.objetivo.toLocaleString('es-AR')} puntos`;
  const modo = partida.modo === 'parejas' ? 'Parejas' : 'Individual';
  return [
    `♠ ♥ La Canasta ♦ ♣`,
    `${modo} · ${meta} · ${partida.rondas.length} ronda${partida.rondas.length === 1 ? '' : 's'}`,
    formatearFecha(partida.finalizadaEn ?? partida.actualizada),
    '',
    ...lineas,
  ].join('\n');
}

export type ResultadoCompartir = 'compartido' | 'copiado' | 'error';

export async function compartirTexto(titulo: string, texto: string): Promise<ResultadoCompartir> {
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title: titulo, text: texto });
      return 'compartido';
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'error';
  }
  try {
    await navigator.clipboard.writeText(texto);
    return 'copiado';
  } catch {
    return 'error';
  }
}

export function descargarArchivo(nombre: string, contenido: string, tipo = 'application/json'): void {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
