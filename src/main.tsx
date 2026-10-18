import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './estilos/index.css';

// Registra el service worker: la app queda instalable y funciona sin conexión.
registerSW({ immediate: true });

const contenedor = document.getElementById('root');
if (!contenedor) throw new Error('No se encontró el contenedor #root');

createRoot(contenedor).render(
  <StrictMode>
    <App />
  </StrictMode>
);
