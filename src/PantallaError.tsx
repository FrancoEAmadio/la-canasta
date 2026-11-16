import { Component, type ErrorInfo, type ReactNode } from 'react';
import { limpiarYRecargar } from './actualizar';

interface Estado {
  error: Error | null;
}

/** Si algo se rompe al dibujar la app, en vez de dejar la pantalla en blanco muestra el error y cómo salir. */
export class PantallaError extends Component<{ children: ReactNode }, Estado> {
  state: Estado = { error: null };

  static getDerivedStateFromError(error: Error): Estado {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('La app se rompió:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const boton = { padding: '14px 16px', borderRadius: 12, border: '2px solid #1d4ed8', fontWeight: 700, fontSize: 16, width: '100%' } as const;
    return (
      <div style={{ minHeight: '100dvh', background: '#0b1b4a', color: '#fff', padding: 24, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Algo se rompió</h1>
        <p style={{ opacity: 0.85 }}>Tus partidas y jugadores no se borraron. Probá recargar; si sigue igual, limpiá los archivos guardados.</p>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: 'rgba(0,0,0,0.35)', padding: 10, borderRadius: 8 }}>{String(this.state.error.message).slice(0, 300)}</pre>
        <button type="button" style={{ ...boton, background: '#fff', color: '#1d4ed8' }} onClick={() => window.location.reload()}>Recargar</button>
        <button type="button" style={{ ...boton, background: 'transparent', color: '#fff', borderColor: '#fff' }} onClick={() => void limpiarYRecargar()}>Limpiar archivos guardados y recargar</button>
      </div>
    );
  }
}
