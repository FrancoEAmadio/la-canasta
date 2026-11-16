/**
 * Colores de jugador: cada uno tiene el suyo (borde y fondo clarito del avatar, punto en la barra
 * de jugadores y línea del gráfico). Se elige al crear el primero libre; se puede cambiar en Editar.
 */
export interface ColorJugador {
  id: string;
  nombre: string;
  hex: string;
}

export const PALETA_JUGADOR: ColorJugador[] = [
  { id: 'azul', nombre: 'Azul', hex: '#2563eb' },
  { id: 'rojo', nombre: 'Rojo', hex: '#dc2626' },
  { id: 'verde', nombre: 'Verde', hex: '#16a34a' },
  { id: 'amarillo', nombre: 'Amarillo', hex: '#ca8a04' },
  { id: 'violeta', nombre: 'Violeta', hex: '#7c3aed' },
  { id: 'naranja', nombre: 'Naranja', hex: '#ea580c' },
  { id: 'rosa', nombre: 'Rosa', hex: '#db2777' },
  { id: 'agua', nombre: 'Agua', hex: '#0891b2' },
  { id: 'gris', nombre: 'Gris', hex: '#475569' },
];

export function esColorValido(valor: unknown): valor is string {
  return typeof valor === 'string' && PALETA_JUGADOR.some((color) => color.id === valor);
}

function hashDe(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i += 1) hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  return hash;
}

/** Color del jugador. Si nunca se le asignó uno (jugadores viejos), sale uno estable según su id. */
function colorDe(jugador: { id: string; color?: string }): ColorJugador {
  return PALETA_JUGADOR.find((color) => color.id === jugador.color) ?? PALETA_JUGADOR[hashDe(jugador.id) % PALETA_JUGADOR.length]!;
}

export function hexColorJugador(jugador: { id: string; color?: string }): string {
  return colorDe(jugador).hex;
}

export function idColorJugador(jugador: { id: string; color?: string }): string {
  return colorDe(jugador).id;
}

/** Primer color que no usa nadie; si ya se usaron todos, el menos repetido. */
export function colorLibre(usados: (string | undefined)[]): string {
  const conteo = new Map(PALETA_JUGADOR.map((color) => [color.id, 0]));
  for (const usado of usados) if (usado && conteo.has(usado)) conteo.set(usado, conteo.get(usado)! + 1);
  let mejor = PALETA_JUGADOR[0]!.id;
  for (const color of PALETA_JUGADOR) if (conteo.get(color.id)! < conteo.get(mejor)!) mejor = color.id;
  return mejor;
}

/** Fondo clarito (mismo color con transparencia) para avatares y chips. */
export function fondoSuave(hex: string): string {
  return `${hex}1f`;
}

/** Igual que estiloElegido pero con fondo sólido (el tinte apoyado sobre blanco): para tarjetas levantadas al arrastrar. */
export function estiloElegidoSolido(jugador: { id: string; color?: string }): { borderColor: string; backgroundColor: string; backgroundImage: string } {
  const hex = hexColorJugador(jugador);
  const tinte = fondoSuave(hex);
  return { borderColor: hex, backgroundColor: '#ffffff', backgroundImage: `linear-gradient(${tinte}, ${tinte})` };
}

/** Colores de los integrantes de un participante (1 en individual, 2 en parejas), en orden. */
export function coloresDelParticipante(
  participante: { jugadoresIds: string[] },
  jugadores: { id: string; color?: string }[]
): string[] {
  return participante.jugadoresIds.map((id) => hexColorJugador(jugadores.find((jugador) => jugador.id === id) ?? { id }));
}

export function colorDelParticipante(participante: { jugadoresIds: string[] }, jugadores: { id: string; color?: string }[]): string | undefined {
  return coloresDelParticipante(participante, jugadores)[0];
}

/** Borde y fondo clarito con el color del jugador, para mostrarlo como elegido (selector, lista y parejas). */
export function estiloElegido(jugador: { id: string; color?: string }): { borderColor: string; backgroundColor: string } {
  const hex = hexColorJugador(jugador);
  return { borderColor: hex, backgroundColor: fondoSuave(hex) };
}
