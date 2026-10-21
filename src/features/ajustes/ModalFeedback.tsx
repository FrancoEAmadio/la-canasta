import { useState } from 'react';
import { enviarFeedback, type TipoFeedback } from '../../infra/feedback';
import { EncabezadoModal, Modal } from '../../ui/Modal';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

const TIPOS: { id: TipoFeedback; etiqueta: string }[] = [
  { id: 'bug', etiqueta: '🐞 Reportar un error (Bug)' },
  { id: 'sugerencia', etiqueta: '💡 Sugerencia / Comentario' },
];

const MENSAJES_ERROR = {
  sin_clave: 'El envío todavía no está configurado en esta versión de la app.',
  sin_conexion: 'No hay conexión a internet. Probá de nuevo cuando vuelvas a estar en línea.',
  rechazado: 'No se pudo enviar el mensaje. Probá de nuevo en un rato.',
  error_red: 'No se pudo conectar para enviar el mensaje. Revisá tu conexión y probá de nuevo.',
} as const;

type Estado = { fase: 'editando' } | { fase: 'enviando' } | { fase: 'enviado' } | { fase: 'error'; texto: string };

export function ModalFeedback({ abierto, onCerrar }: Props) {
  const [tipo, setTipo] = useState<TipoFeedback>('bug');
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState<Estado>({ fase: 'editando' });

  const enviando = estado.fase === 'enviando';
  const puedeEnviar = mensaje.trim().length > 0 && !enviando;

  const cerrar = () => {
    if (enviando) return;
    onCerrar();
    // Tras un envío exitoso el formulario queda limpio para la próxima vez.
    if (estado.fase === 'enviado') {
      setNombre('');
      setMensaje('');
      setTipo('bug');
    }
    setEstado({ fase: 'editando' });
  };

  const enviar = async () => {
    if (!puedeEnviar) return;
    setEstado({ fase: 'enviando' });
    const resultado = await enviarFeedback({ tipo, nombre, mensaje });
    setEstado(resultado.ok ? { fase: 'enviado' } : { fase: 'error', texto: MENSAJES_ERROR[resultado.motivo] });
  };

  return (
    <Modal abierto={abierto} onCerrar={cerrar} ancho="max-w-md" zIndex="z-[70]" etiqueta="Enviar comentarios o reportar error">
      <EncabezadoModal titulo="💬 Comentarios" subtitulo="Errores y sugerencias" onCerrar={cerrar} />

      {estado.fase === 'enviado' ? (
        <>
          <div className="flex flex-col items-center gap-2 p-8 text-center" role="status">
            <span className="text-4xl" aria-hidden="true">
              ✅
            </span>
            <p className="text-sm font-bold leading-relaxed text-tinta">¡Gracias! Tu observación fue enviada correctamente.</p>
          </div>
          <div className="border-t border-slate-200 p-4">
            <button type="button" onClick={cerrar} className="btn-primario w-full py-3 text-sm">
              Cerrar
            </button>
          </div>
        </>
      ) : (
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(evento) => {
            evento.preventDefault();
            void enviar();
          }}
        >
          <div className="scroll-oculto flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="grid gap-2" role="radiogroup" aria-label="Tipo de mensaje">
              {TIPOS.map((opcion) => {
                const activo = tipo === opcion.id;
                return (
                  <button
                    key={opcion.id}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    disabled={enviando}
                    onClick={() => setTipo(opcion.id)}
                    className={`${activo ? 'btn-primario' : 'btn-claro'} justify-center px-4 py-3 text-sm`}
                  >
                    {opcion.etiqueta}
                  </button>
                );
              })}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Tu nombre (opcional)</span>
              <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} type="text" maxLength={60} disabled={enviando} placeholder="Tu nombre (opcional)" className="campo" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Mensaje</span>
              <textarea
                value={mensaje}
                onChange={(evento) => setMensaje(evento.target.value)}
                required
                rows={6}
                maxLength={3000}
                disabled={enviando}
                placeholder="Describe el error que encontraste o tu sugerencia para mejorar la app..."
                className="campo resize-none"
              />
            </label>

            {estado.fase === 'error' && (
              <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-900">
                {estado.texto}
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 p-4">
            <button type="submit" disabled={!puedeEnviar} className="btn-secundario w-full py-3.5 text-base">
              {enviando ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
