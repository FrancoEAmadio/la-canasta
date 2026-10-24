import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './estilos/index.css';

// Registra el service worker: la app queda instalable y funciona sin conexión.
registerSW({ immediate: true });

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

const contenedor = document.getElementById('root');
if (!contenedor) throw new Error('No se encontró el contenedor #root');

createRoot(contenedor).render(
  <StrictMode>
    <App />
  </StrictMode>
);
