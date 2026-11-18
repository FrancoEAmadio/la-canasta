import { calcularRanking, formatearFecha } from '../dominio/partida';
import { formatearPuntos } from '../dominio/puntuacion';
import type { Partida } from '../tipos';
import type { SerieGrafico } from '../ui/GraficoEvolucion';
import { descargarArchivo, textoResultado } from './compartir';

/**
 * Tarjeta PNG con el resultado (como la de Skull King, con los colores de La Canasta):
 * título, puestos con puntos y, si hay al menos una ronda, el gráfico de evolución.
 */

const ANCHO = 1080;
const AZUL_FONDO_ARRIBA = '#1e3a8a';
const AZUL_FONDO_ABAJO = '#0b1437';
const COLORES_RESPALDO = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a78bfa', '#22d3ee'];

export type ResultadoTarjeta = 'compartido' | 'descargado' | 'cancelado' | 'error';

function rectRedondeado(ctx: CanvasRenderingContext2D, x: number, y: number, ancho: number, alto: number, radio: number) {
  ctx.beginPath();
  ctx.moveTo(x + radio, y);
  ctx.arcTo(x + ancho, y, x + ancho, y + alto, radio);
  ctx.arcTo(x + ancho, y + alto, x, y + alto, radio);
  ctx.arcTo(x, y + alto, x, y, radio);
  ctx.arcTo(x, y, x + ancho, y, radio);
  ctx.closePath();
}

function recortarTexto(ctx: CanvasRenderingContext2D, texto: string, anchoMax: number): string {
  if (ctx.measureText(texto).width <= anchoMax) return texto;
  let recortado = texto;
  while (recortado.length > 1 && ctx.measureText(`${recortado}…`).width > anchoMax) recortado = recortado.slice(0, -1);
  return `${recortado}…`;
}

/** Fondo azul con el mosaico de palos de la app, que se desvanece hacia abajo. */
function dibujarFondo(ctx: CanvasRenderingContext2D, alto: number) {
  const base = ctx.createLinearGradient(0, 0, 0, alto);
  base.addColorStop(0, AZUL_FONDO_ARRIBA);
  base.addColorStop(0.55, AZUL_FONDO_ABAJO);
  base.addColorStop(1, AZUL_FONDO_ABAJO);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, ANCHO, alto);

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.font = '44px Georgia, serif';
  ctx.textAlign = 'center';
  const palos = ['♠', '♦', '♣', '♥'];
  for (let fila = 0; fila * 120 < alto * 0.8; fila += 1) {
    for (let columna = 0; columna * 135 < ANCHO + 135; columna += 1) {
      const desplazamiento = fila % 2 === 0 ? 0 : 67;
      ctx.fillText(palos[(fila + columna) % 4]!, 40 + columna * 135 + desplazamiento, 70 + fila * 120);
    }
  }
  ctx.restore();
}

function dibujarGrafico(ctx: CanvasRenderingContext2D, series: SerieGrafico[], x0: number, y0: number, ancho: number, alto: number) {
  const cantidad = Math.max(...series.map((serie) => serie.puntos.length), 0);
  if (cantidad < 2) return;
  const todos = series.flatMap((serie) => serie.puntos);
  const minimo = Math.min(0, ...todos);
  const maximo = Math.max(100, ...todos);
  const rango = maximo - minimo || 1;
  const izquierda = 100;
  const abajo = 34;
  const anchoUtil = ancho - izquierda - 10;
  const altoUtil = alto - abajo - 10;
  const px = (indice: number) => x0 + izquierda + (indice / (cantidad - 1)) * anchoUtil;
  const py = (valor: number) => y0 + 10 + (1 - (valor - minimo) / rango) * altoUtil;

  ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#bfdbfe';
  ctx.strokeStyle = 'rgba(191, 219, 254, 0.18)';
  ctx.lineWidth = 1;
  for (const marca of [minimo, minimo + rango / 2, maximo]) {
    ctx.beginPath();
    ctx.moveTo(x0 + izquierda, py(marca));
    ctx.lineTo(x0 + ancho - 10, py(marca));
    ctx.stroke();
    ctx.fillText(formatearPuntos(Math.round(marca)), x0 + izquierda - 12, py(marca) + 7);
  }
  ctx.textAlign = 'center';
  const paso = cantidad > 12 ? 2 : 1;
  for (let indice = 0; indice < cantidad; indice += 1) {
    if (indice % paso === 0 || indice === cantidad - 1) ctx.fillText(indice === 0 ? 'Inicio' : `R${indice}`, px(indice), y0 + alto - 6);
  }

  series.forEach((serie, indiceSerie) => {
    const color = serie.color ?? COLORES_RESPALDO[indiceSerie % COLORES_RESPALDO.length]!;
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    serie.puntos.forEach((valor, indice) => (indice === 0 ? ctx.moveTo(px(indice), py(valor)) : ctx.lineTo(px(indice), py(valor))));
    ctx.stroke();
    const ultimo = serie.puntos.length - 1;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px(ultimo), py(serie.puntos[ultimo]!), 8, 0, Math.PI * 2);
    ctx.fill();
  });
}

function dibujarPalo(ctx: CanvasRenderingContext2D, simbolo: string, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillText(simbolo, x, y);
}

export async function crearTarjetaResultado(partida: Partida, series: SerieGrafico[]): Promise<Blob | null> {
  const ranking = calcularRanking(partida).slice(0, 10);
  const finalizada = partida.estado === 'finalizada';
  const colores = series.map((serie) => serie.color);
  // Mismo criterio que el gráfico de la app: colores propios solo si no se repiten.
  const seriesTarjeta =
    colores.every(Boolean) && new Set(colores).size === series.length ? series : series.map((serie) => ({ ...serie, color: undefined }));
  const conGrafico = seriesTarjeta.length > 0 && Math.max(...seriesTarjeta.map((serie) => serie.puntos.length)) >= 2;

  const altoFila = 96;
  const altoGrafico = conGrafico ? 380 : 0;
  const cabecera = 400;
  const alto = cabecera + ranking.length * altoFila + (conGrafico ? altoGrafico + 120 : 0) + 90;

  const lienzo = document.createElement('canvas');
  lienzo.width = ANCHO;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  if (!ctx) return null;

  try {
    await Promise.all([document.fonts?.load('900 40px "Cinzel"'), document.fonts?.load('700 30px "Plus Jakarta Sans"')]);
  } catch {
    /* si las fuentes no cargan se usan las de respaldo */
  }

  dibujarFondo(ctx, alto);
  ctx.strokeStyle = 'rgba(147, 197, 253, 0.55)';
  ctx.lineWidth = 4;
  rectRedondeado(ctx, 24, 24, ANCHO - 48, alto - 48, 36);
  ctx.stroke();

  // Cabecera: palos, "LA" entre líneas, "CANASTA" grande, título y fecha.
  ctx.textAlign = 'center';
  ctx.font = '64px Georgia, serif';
  dibujarPalo(ctx, '♠', ANCHO / 2 - 135, 130, '#e2e8f0');
  dibujarPalo(ctx, '♥', ANCHO / 2 - 45, 130, '#ef4444');
  dibujarPalo(ctx, '♦', ANCHO / 2 + 45, 130, '#ef4444');
  dibujarPalo(ctx, '♣', ANCHO / 2 + 135, 130, '#e2e8f0');

  ctx.fillStyle = '#dbeafe';
  ctx.font = '700 34px "Cinzel", Georgia, serif';
  ctx.fillText('L A', ANCHO / 2, 190);
  ctx.strokeStyle = 'rgba(191, 219, 254, 0.6)';
  ctx.lineWidth = 2;
  for (const lado of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(ANCHO / 2 + lado * 50, 178);
    ctx.lineTo(ANCHO / 2 + lado * 140, 178);
    ctx.stroke();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 112px "Cinzel", Georgia, serif';
  ctx.fillText('CANASTA', ANCHO / 2, 292);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 30px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(finalizada ? 'RESULTADO FINAL' : 'TABLA GENERAL', ANCHO / 2, 344);
  ctx.fillStyle = '#bfdbfe';
  ctx.font = '600 26px "Plus Jakarta Sans", system-ui, sans-serif';
  const rondas = partida.rondas.length;
  const modo = partida.modo === 'parejas' ? 'Parejas' : 'Individual';
  ctx.fillText(
    `${modo} · ${rondas} ronda${rondas === 1 ? '' : 's'} · ${formatearFecha(partida.finalizadaEn ?? partida.actualizada)}`,
    ANCHO / 2,
    382
  );

  let y = cabecera + 20;
  ranking.forEach((fila) => {
    const primero = fila.posicion === 1;
    ctx.fillStyle = primero ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.08)';
    rectRedondeado(ctx, 70, y, ANCHO - 140, altoFila - 14, 22);
    ctx.fill();
    if (primero) {
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = primero ? '#ffffff' : '#bfdbfe';
    ctx.font = '800 38px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(`${fila.posicion}.º`, 100, y + 56);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 38px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(recortarTexto(ctx, fila.participante.nombre, 540), 190, y + 56);
    ctx.textAlign = 'right';
    ctx.font = '800 40px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = fila.puntos < 0 ? '#f87171' : '#ffffff';
    ctx.fillText(`${formatearPuntos(fila.puntos)} pts`, ANCHO - 100, y + 57);
    y += altoFila;
  });

  if (conGrafico) {
    y += 30;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 26px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('EVOLUCIÓN POR RONDA', 80, y + 24);
    dibujarGrafico(ctx, seriesTarjeta, 70, y + 44, ANCHO - 140, altoGrafico - 60);
    y += altoGrafico;
    ctx.font = '600 24px "Plus Jakarta Sans", system-ui, sans-serif';
    let xLeyenda = 80;
    let yLeyenda = y + 10;
    seriesTarjeta.forEach((serie, indice) => {
      const nombre = recortarTexto(ctx, serie.nombre, 220);
      const anchoItem = ctx.measureText(nombre).width + 46;
      if (xLeyenda + anchoItem > ANCHO - 80) {
        xLeyenda = 80;
        yLeyenda += 40;
      }
      ctx.fillStyle = serie.color ?? COLORES_RESPALDO[indice % COLORES_RESPALDO.length]!;
      ctx.beginPath();
      ctx.arc(xLeyenda + 10, yLeyenda + 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dbeafe';
      ctx.textAlign = 'left';
      ctx.fillText(nombre, xLeyenda + 30, yLeyenda + 20);
      xLeyenda += anchoItem + 14;
    });
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(219, 234, 254, 0.7)';
  ctx.font = '500 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Desarrollado por Franco Ezequiel Amadio', ANCHO / 2, alto - 52);

  return new Promise((resolver) => lienzo.toBlob((blob) => resolver(blob), 'image/png'));
}

/** Fecha de hoy (AAAA-MM-DD) en la hora del dispositivo. */
function fechaLocalISO(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}

/** Comparte la tarjeta como imagen (celulares) o la descarga si el navegador no puede compartir archivos. */
export async function compartirTarjetaResultado(partida: Partida, series: SerieGrafico[]): Promise<ResultadoTarjeta> {
  const blob = await crearTarjetaResultado(partida, series);
  if (!blob) return 'error';
  const nombreArchivo = `la-canasta-resultado-${fechaLocalISO()}.png`;
  const archivo = new File([blob], nombreArchivo, { type: 'image/png' });
  try {
    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [archivo] })) {
      await navigator.share({ files: [archivo], title: 'La Canasta — Resultado', text: textoResultado(partida) });
      return 'compartido';
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelado';
  }
  descargarArchivo(nombreArchivo, blob, 'image/png');
  return 'descargado';
}
