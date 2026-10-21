// ════════════════════════════════════════════════════════════════════════
//  ENVÍO DE COMENTARIOS Y REPORTES DE ERROR (Web3Forms)
//  1. Creá una clave gratis en https://web3forms.com (te la mandan por mail).
//  2. Pegala acá abajo reemplazando "TU_CLAVE_AQUI". Listo: el mail nunca se muestra en la app.
// ════════════════════════════════════════════════════════════════════════
export const FEEDBACK_ACCESS_KEY = 'TU_CLAVE_AQUI';

const FEEDBACK_URL = 'https://api.web3forms.com/submit';
const TIEMPO_MAXIMO_MS = 15000;

export type TipoFeedback = 'bug' | 'sugerencia';

export interface DatosFeedback {
  tipo: TipoFeedback;
  nombre: string;
  mensaje: string;
}

export type ResultadoFeedback = { ok: true } | { ok: false; motivo: 'sin_clave' | 'sin_conexion' | 'rechazado' | 'error_red' };

/** Envía el mensaje en segundo plano (fetch + JSON), sin abrir ninguna app de correo. */
export async function enviarFeedback({ tipo, nombre, mensaje }: DatosFeedback): Promise<ResultadoFeedback> {
  if (!FEEDBACK_ACCESS_KEY || FEEDBACK_ACCESS_KEY === 'TU_CLAVE_AQUI') return { ok: false, motivo: 'sin_clave' };
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { ok: false, motivo: 'sin_conexion' };

  const etiqueta = tipo === 'bug' ? 'Error (bug)' : 'Sugerencia / comentario';
  const controlador = new AbortController();
  const temporizador = window.setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);
  try {
    const respuesta = await fetch(FEEDBACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: FEEDBACK_ACCESS_KEY,
        subject: `La Canasta — ${etiqueta}`,
        from_name: nombre.trim() || 'Anónimo',
        name: nombre.trim() || 'Anónimo',
        tipo: etiqueta,
        message: mensaje.trim(),
        dispositivo: navigator.userAgent,
      }),
      signal: controlador.signal,
    });
    const datos = (await respuesta.json().catch(() => null)) as { success?: boolean } | null;
    return respuesta.ok && datos?.success ? { ok: true } : { ok: false, motivo: 'rechazado' };
  } catch {
    return { ok: false, motivo: 'error_red' };
  } finally {
    window.clearTimeout(temporizador);
  }
}
