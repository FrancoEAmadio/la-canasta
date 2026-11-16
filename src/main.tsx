import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { iniciarServiceWorker, limpiarYRecargar } from './actualizar';
import { PantallaError } from './PantallaError';
import './estilos/index.css';

// Registra el service worker: la app queda instalable y funciona sin conexión.
iniciarServiceWorker();

// Bloquea el zoom por pellizco (iOS ignora user-scalable=no): el scroll con un dedo sigue funcionando normal.
document.addEventListener('gesturestart', (evento) => evento.preventDefault(), { passive: false });
document.addEventListener('gesturechange', (evento) => evento.preventDefault(), { passive: false });
document.addEventListener(
  'touchmove',
  (evento) => {
    if (evento.touches.length > 1) evento.preventDefault();
  },
  { passive: false }
);

// Sin menú contextual (mantener apretado) ni arrastrar imágenes, salvo en los campos de texto.
document.addEventListener('contextmenu', (evento) => {
  const elemento = evento.target as HTMLElement | null;
  if (elemento?.closest('input, textarea')) return;
  evento.preventDefault();
});
document.addEventListener('dragstart', (evento) => evento.preventDefault());

// Si después de una actualización falta un archivo viejo, se limpia todo y se recarga una sola vez.
window.addEventListener('vite:preloadError', () => {
  try {
    if (sessionStorage.getItem('recarga-por-error')) return;
    sessionStorage.setItem('recarga-por-error', '1');
  } catch {
    /* sin sessionStorage: se recarga igual */
  }
  void limpiarYRecargar();
});

const contenedor = document.getElementById('root');
if (!contenedor) throw new Error('No se encontró el contenedor #root');

createRoot(contenedor).render(
  <StrictMode>
    <PantallaError>
      <App />
    </PantallaError>
  </StrictMode>
);
