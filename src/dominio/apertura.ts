import { CONFIG_APERTURA } from '../constantes.ts';

export interface ConfigApertura {
  readonly umbrales: readonly number[];
  readonly requisitos: readonly number[];
}

/** Índice del tramo (0, 1, 2…) al que pertenece el puntaje acumulado. */
export function nivelApertura(puntosAcumulados: number, config: ConfigApertura = CONFIG_APERTURA): number {
  let nivel = 0;
  for (const umbral of config.umbrales) {
    if (puntosAcumulados >= umbral) nivel += 1;
  }
  return nivel;
}

/** Puntos mínimos que hay que bajar para abrirse / levantar el pozo. */
export function requisitoApertura(puntosAcumulados: number, config: ConfigApertura = CONFIG_APERTURA): number {
  const requisito = config.requisitos[nivelApertura(puntosAcumulados, config)];
  return requisito ?? config.requisitos[config.requisitos.length - 1]!;
}

export interface TramoApertura {
  desde: number | null;
  hasta: number | null;
  requisito: number;
}

/** Tabla legible de todos los tramos (para mostrar en pantalla). */
export function tramosApertura(config: ConfigApertura = CONFIG_APERTURA): TramoApertura[] {
  return config.requisitos.map((requisito, indice) => ({
    desde: indice === 0 ? null : config.umbrales[indice - 1]!,
    hasta: indice < config.umbrales.length ? config.umbrales[indice]! - 1 : null,
    requisito,
  }));
}
