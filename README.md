# ♠ ♥ La Canasta ♦ ♣ — Anotador inteligente de puntos

PWA para llevar la puntuación del juego de cartas **Canasta**: gestor de jugadores/equipos, contador de puntos por ronda,
estadísticas, historial y manual interactivo con catálogo de naipes. Construida con la **misma arquitectura que la app de
Skull King** (Vite + React 19 + TypeScript + Tailwind CSS v4), pero con la puntuación y la estética de La Canasta.

## Comandos

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # build de producción (genera también el service worker)
npm run preview    # sirve el build (para probar la instalación / modo sin conexión)
npm run typecheck  # chequeo de tipos
npm test           # tests de la lógica de puntaje (Node 22+)
```

Requiere Node.js 20+ (los tests usan Node 22.6+).

## Dónde editar las reglas

Todo lo que suma o resta puntos está en **`src/constantes.ts`**:

| Objeto | Qué controla |
| --- | --- |
| `CONFIG_APERTURA` | Umbrales `[500, 1000]` y requisitos `[50, 90, 120]` para abrirse / levantar el pozo |
| `CONFIG_PUNTAJE` | Bonos (+100), Tres Rojos (100/200/300/500), canastas, valor por carta, Tres Negros (−100), premios opcionales |
| `PUNTAJE_OBJETIVO_DEFECTO` / `OPCIONES_OBJETIVO` | Meta para ganar (por defecto 5.000; también hay 3.000, 7.500, 10.000 y sin límite) |
| `LIMITES_MAZO` | Cantidad física de cartas (2 mazos + 4 Jokers) que usa la validación de contadores |

Los textos del manual y del catálogo leen esos valores, así que si cambiás un número se actualiza en toda la app.

## Estructura

```
src/
  main.tsx / App.tsx        punto de entrada y enrutado de pantallas
  constantes.ts             ⚙️ configuración editable del juego
  tipos/                    tipos de dominio
  datos/                    catálogo de cartas y reglas (textos)
  dominio/                  lógica pura y testeada
    puntuacion.ts           cálculo de la ronda (bloques 1-4)
    apertura.ts             puntaje mínimo para abrirse (50 / 90 / 120)
    partida.ts              acumulados, ranking, orden de mesa
    validaciones.ts         límites del mazo y avisos
    estadisticas.ts         estadísticas por jugador
  infra/                    localStorage tipado, compartir, vibración
  estado/AppProvider.tsx    estado global
  features/
    inicio/  jugadores/  partida/  wiki/  modales/  ajustes/
  ui/                       componentes genéricos (Naipe SVG, modales, contadores…)
tests/                      tests de puntuación
```

## Persistencia

No hay servidor: igual que la app de Skull King, los datos se guardan en **localStorage** del dispositivo
(jugadores y estadísticas, partidas en curso, historial y ajustes). Las partidas en curso se guardan en cada toque,
así que se puede cerrar la app y **reanudar** desde Inicio o desde el Historial.
Desde **Ajustes → Copia de seguridad** se puede exportar/importar un archivo `.json` (por ejemplo, para pasar los datos a otro celular).

## PWA

`vite-plugin-pwa` genera el manifest y el service worker: la app se puede **instalar** en el celular y **funciona sin conexión**
(las tipografías están incluidas en el build, no se usan enlaces externos). Se actualiza sola cuando publicás una versión nueva.
Para publicarla en cualquier hosting estático (GitHub Pages, Netlify, Vercel…) alcanza con subir la carpeta `dist/`
(el `base` es relativo: `./`). Para instalarla hace falta servirla por HTTPS.

## Mejoras agregadas (además de lo pedido)

- Corrección de **cualquier** ronda anterior y «Deshacer última ronda».
- **Meta de puntos** configurable con barra de avance y cierre de partida al alcanzarla (o seguir jugando).
- Validación por mazo físico (no se pueden cargar más Jokers, Tres Rojos o Tres Negros que los que existen) y avisos de carga dudosa.
- «Corte exacto» y «Cerró la ronda» exclusivos de un solo jugador/equipo; quien cierra en individual no resta cartas de la mano.
- Gráfico de evolución del puntaje, desglose por ronda, compartir resultado y estadísticas por modo (individual / parejas).
- Parejas al azar, mantener pantalla encendida durante la partida, vibración al tocar contadores y copia de seguridad.
- Premios opcionales por cantidad de canastas (Canastrón / Canasta de canastas), desactivados por defecto.
