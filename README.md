# Usuarios — prueba técnica React + TypeScript

Aplicación que consume la API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com):

- Lista de usuarios con **búsqueda por nombre** (en el servidor).
- Al elegir un usuario, **sus publicaciones** (paginadas) y un **formulario validado** para crear una
  nueva (título y texto obligatorios). La API no guarda los datos: la publicación aparece en la lista
  y se mantiene durante la sesión.
- **Estados de carga, error (con reintentar) y vacío** visibles en cada vista.
- **133 tests** (Vitest + Testing Library + MSW).
- Responsive (mobile-first) y accesible.

---

## Cómo ejecutarlo

**Requisitos:** Node 22 (`.nvmrc`) y pnpm 10 (versión fijada en `packageManager`; con Corepack:
`corepack enable`).

```bash
pnpm install
cp .env.example .env        # VITE_API_URL=https://jsonplaceholder.typicode.com
pnpm dev                    # http://localhost:5173
```

| Script                              | Qué hace                                                    |
| ----------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                          | Servidor de desarrollo (Vite)                               |
| `pnpm test`                         | Ejecuta los tests una vez (`pnpm test:watch` en modo watch) |
| `pnpm typecheck`                    | Comprobación de tipos (`tsc -b`)                            |
| `pnpm lint`                         | ESLint                                                      |
| `pnpm format` / `pnpm format:check` | Prettier                                                    |
| `pnpm build` / `pnpm preview`       | Build de producción y previsualización                      |

Los tests **no usan la red**: MSW simula la API y cualquier petición sin handler hace fallar el test.

### Cómo ver los estados de carga y error

Con la app abierta, en DevTools → **Network**:

- **Error de red:** clic derecho sobre una petición a `jsonplaceholder.typicode.com` →
  **Block request domain** y recargar. Aparece el error con **Reintentar**; al desbloquear
  (More tools → Network request blocking) y pulsar Reintentar, se recupera. Bloqueando solo
  `*/posts*` se ve el error de publicaciones (o del envío del formulario).
- **Carga lenta:** throttling **3G** para ver skeletons y el indicador de búsqueda.
- **Usuario inexistente:** `/users/999` o `/users/abc`. **Ruta inexistente:** `/cualquier-cosa`.
- **Sin resultados:** buscar `zzz`.

> No uses "Offline" + recargar: el navegador no puede descargar la propia app y no llega a ejecutarse.

---

## Stack

| Área        | Elección                                                            |
| ----------- | ------------------------------------------------------------------- |
| Base        | Vite 8 + React 19 + TypeScript (strict, `noUncheckedIndexedAccess`) |
| Estilos     | Bootstrap 5.3 **solo CSS** + componentes propios + `theme.css`      |
| Datos       | TanStack Query 5 + cliente `fetch` propio validado con Zod 4        |
| Routing     | React Router 8 (data router)                                        |
| Formularios | React Hook Form + Zod (`@hookform/resolvers`)                       |
| UI          | Sonner (toasts), lucide-react (iconos)                              |
| Tests       | Vitest 5, Testing Library, user-event, jest-dom, MSW 3              |
| Calidad     | ESLint 10 + typescript-eslint, Prettier, pnpm                       |

## Estructura

```
src/
  api/          cliente HTTP, errores, esquemas Zod y servicios (sin React)
  app/          App, rutas, QueryClient, páginas de error y 404
  features/
    users/      lista de usuarios con búsqueda
    posts/      detalle del usuario, publicaciones y formulario
  components/
    ui/         componentes reutilizables sin lógica de dominio (Button, Input, Drawer…)
    layout/     estructura de página (AppLayout, SplitView, PageHeader, BackLink)
  hooks/        useDebouncedValue, useSearchParamState
  lib/          utilidades puras (cx, escapeRegExp)
  test/         setup, MSW (réplica de json-server) y helper renderRoute
```

Las convenciones del proyecto (reglas no negociables, arquitectura y decisiones) están en
[`CLAUDE.md`](CLAUDE.md).

---

## Decisiones

### Datos y API

- **Cliente `fetch` propio en lugar de Axios.** `request()` añade la base URL, serializa query y
  body, aplica timeout y cancelación (`signal` de TanStack Query) y **valida cada respuesta con Zod**.
  Cualquier fallo (red, timeout, cancelación, HTTP, JSON o esquema inválido) se convierte en un único
  `ApiError` con un `kind`; `getErrorMessage()` lo traduce a un mensaje para el usuario. Los tipos
  salen de los esquemas (`z.output`), sin interfaces duplicadas.
- **TanStack Query** con fábricas de query keys y `queryOptions`. Solo se reintentan una vez los
  fallos transitorios (red, timeout, 5xx); un 404 o una respuesta inválida no mejoran reintentando.
- **Búsqueda en el servidor con `name_like`.** Lo verifiqué contra la API real: filtra solo por
  nombre, es parcial y no distingue mayúsculas. `q=` se descartó porque busca en **todos** los campos
  (`q=gwenborough` encuentra a Leanne por su ciudad). `name_like` es una **regex en el servidor**: sin
  escapar, `.` devuelve todos y `(` provoca un HTTP 500, así que el término se escapa antes de enviarlo.
- **La búsqueda vive en la URL** (`?q=`) con debounce de 300 ms: se puede compartir el enlace, el
  botón atrás funciona y se conserva al entrar en un usuario y volver. Mientras llega la respuesta se
  mantiene la lista anterior (`keepPreviousData`).
- **Usuarios sin paginación**, ordenados por nombre en el servidor: son pocos y la lista hace scroll
  propio.
- **El detalle no depende del listado:** `/users/:userId` carga el usuario con su propia query, en
  paralelo con sus publicaciones, así funciona el enlace directo aunque el usuario no esté en la lista
  visible. El parámetro se valida con Zod: `/users/abc` o un 404 muestran "Usuario no encontrado".

### Una API que no guarda nada

- **La caché es la fuente de verdad durante la sesión.** Las publicaciones se piden una vez y nunca
  se consideran obsoletas (`staleTime`/`gcTime: Infinity`, sin refetch al volver a la pestaña): un
  refetch borraría las creadas.
- **Crear una publicación usa `setQueryData`, nunca `invalidateQueries`:** se inserta al principio de
  la lista en caché. Por eso el formulario solo aparece cuando la lista ya está cargada.
- **JSONPlaceholder devuelve siempre `id: 101`.** Con dos publicaciones creadas habría `key`
  duplicadas, así que `createPost` lo sustituye por `crypto.randomUUID()`. El esquema normaliza el `id`
  a string para que las del servidor y las creadas compartan tipo.
- **Publicaciones paginadas en el cliente (5 por página)**, sobre la lista en memoria (servidor +
  creadas). Paginar en el servidor no cuadraría el total ni las páginas con publicaciones que el
  servidor no conoce. Es la única excepción a la regla de paginar en el servidor (documentada en el `CLAUDE.md`).

### Formulario

- **React Hook Form + Zod**: el esquema es la única fuente de validación y de tipos. Recorta espacios
  (un título de solo espacios es inválido) y limita la longitud (100 / 500).
- Errores junto a cada campo, enlazados con `aria-describedby`, y foco en el primer campo inválido.
  Contador de caracteres sin `maxLength` nativo, para que el usuario vea el contador en rojo y el error
  en lugar de que el navegador corte lo que escribe.
- **Sin doble envío:** el botón pasa a "Publicando…" y se deshabilita. Si la API falla, toast de error
  y el formulario conserva lo escrito; si va bien, toast, la publicación aparece resaltada y se vuelve
  a la página 1.
- El formulario vive en un **panel lateral (Drawer) sobre `<dialog>` nativo**: el navegador aporta el
  foco atrapado, Escape, el bloqueo del resto de la página y la devolución del foco, sin el JS de
  Bootstrap.

### Interfaz

- **Bootstrap solo como CSS y una capa propia `components/ui/`** (Button con estado de carga, Input,
  Textarea, SearchInput, Pagination, ErrorState, EmptyState, Skeleton, Avatar, Drawer, Toaster) en
  lugar de `react-bootstrap`: API pensada para la app, accesibilidad incluida y sin dependencias
  extra. Las features no usan `<button>` ni `<input>` sueltos.
- **Maestro-detalle responsive:** en escritorio, usuarios (4/12) y detalle (8/12) **ajustados al alto
  de la pantalla**, cada uno con su propio scroll; en móvil se ve un panel u otro según la URL, sin
  JavaScript de media queries.
- **Accesibilidad:** skip-link, landmarks, `<h1>` por página, nombres accesibles en enlaces y
  controles, `aria-current` en el usuario seleccionado, `role="alert"` en errores de carga,
  `role="status"` en carga y estados vacíos, y región `aria-live` para los toasts.
- **Feedback:** errores de carga en línea con "Reintentar" (un toast desaparecería y dejaría la vista
  vacía sin explicación); toasts solo para el resultado de crear una publicación.
- **Carga diferida del detalle:** `/users/:userId` se carga bajo demanda (`lazy` de React Router),
  así que el formulario, React Hook Form y el Drawer no forman parte de la carga inicial. React,
  React Router y TanStack van en un chunk propio que se mantiene en caché entre despliegues, y ningún
  chunk supera los 500 kB.

### Tests

- **Vitest + Testing Library + MSW.** Los handlers replican el comportamiento de json-server
  (`name_like` como regex, `_sort`, 404, el `id: 101` del POST), así que los tests de las pantallas
  recorren el flujo real: componente → TanStack Query → `request()` → "servidor".
- Consultas por **rol y nombre accesible**, no por clases ni test-ids: si un test no encuentra un
  elemento por su rol, suele ser un problema de accesibilidad.
- `renderRoute({ path })` monta las rutas reales con router en memoria y un QueryClient aislado.
- Cubren: cliente HTTP y errores, servicios, reintentos, componentes de `ui/`, búsqueda (debounce,
  URL, escapado), estados de carga/error/vacío, detalle (enlace directo, 404, id inválido) y
  formulario (validación, creación, doble envío, error de la API, persistencia en sesión y paginación).

### Versiones

Se usaron las últimas versiones estables. **TypeScript está fijado a `~6.0`** porque
`typescript-eslint` todavía no soporta TypeScript 7.

---

## Qué haría con más tiempo

- **Persistir las publicaciones creadas** (por ejemplo en `localStorage`) para que sobrevivan a una
  recarga.
- **Actualización optimista** al crear, con vuelta atrás si la API falla.
- **CI con GitHub Actions** (typecheck, lint, format y tests) y **despliegue** con enlace en este
  README.
- **Modo demo con MSW en el navegador** para que quien revise pueda simular error, lentitud o lista
  vacía con un clic, sin DevTools.
- **Internacionalización (i18n):** sacar todos los textos de la interfaz a catálogos por idioma
  (español e inglés, como mínimo), incluidos formatos de números y fechas y la detección del idioma
  del navegador.
- **Códigos de error genéricos y traducibles:** hoy `getErrorMessage()` convierte cada `ApiError` (su
  `kind` y su `status`) directamente en un texto en español. Lo cambiaría por **códigos estables**
  (`NETWORK_ERROR`, `TIMEOUT`, `NOT_FOUND`, `SERVER_ERROR`, `INVALID_RESPONSE`, `VALIDATION_ERROR`…)
  que la interfaz traduce con el catálogo de i18n, y haría lo mismo con los mensajes de validación de
  Zod (claves en lugar de textos). Así el mismo error se muestra en cualquier idioma y, además, se
  puede registrar y monitorizar por código.
- Manejo global de errores de mutaciones (`MutationCache.onError`), cobertura de tests en CI e
  interruptor de modo oscuro (Bootstrap 5.3 ya lo soporta con `data-bs-theme`).
- Si la lista de usuarios creciera: paginarla en el servidor (la API lo permite con `_page`/`_limit`
  y devuelve el total en `X-Total-Count`) o virtualizar la lista.

---

## Cómo usé la IA

Trabajé con **Claude Code** como asistente durante todo el desarrollo: yo definía el alcance, las
reglas y el diseño, revisaba cada bloque y decidía; la IA proponía, implementaba, verificaba y hacía
los commits.

**Las tecnologías las elegí yo.** Le pedí a la IA un análisis de opciones con sus pros y contras,
pero la decisión de qué usar fue mía, y la fijé como **lista cerrada** en el `CLAUDE.md`: pnpm,
Bootstrap, TanStack Query, React Hook Form + Zod, Sonner, lucide-react y Vitest + Testing Library +
MSW. Elegir yo cada pieza me da **control sobre lo que se construye**: sé por qué está cada
dependencia, conozco cómo funciona y la IA no puede añadir ninguna otra sin mi aprobación.

### Qué le pedí

- Un **análisis de opciones y buenas prácticas** para cada parte del stack, para decidir yo con
  información, y después un [`CLAUDE.md`](CLAUDE.md) con todo lo decidido y **reglas no negociables**
  (pnpm, solo librerías aprobadas, formularios con React Hook Form + Zod, búsqueda en servidor, manejo
  de errores en cada endpoint, todo responsive, sin código muerto).
- Construir la app **por bloques pequeños** (API, componentes de `ui/`, layout, usuarios,
  publicaciones), **parando tras cada uno** para revisarlo, con un commit por bloque.
- **Verificar contra la API real** lo que no estaba claro (filtros de búsqueda y ordenación).
- Diagnosticar errores que yo veía en el navegador y revisar propuestas de diseño.

### Qué acepté

- Patrones de implementación dentro del stack que elegí: cliente `fetch` propio con validación Zod y
  un único `ApiError`, una capa `ui/` propia sobre el CSS de Bootstrap en lugar de `react-bootstrap`
  y MSW replicando json-server para los tests.
- `name_like` con escapado de la regex tras verlo probado contra la API (incluido el HTTP 500 sin
  escapar), y descartar `q=`.
- El enfoque para una API que no persiste: caché como fuente de verdad, `setQueryData` en lugar de
  invalidar, e id generado en cliente.
- `lucide-react` para los iconos y el Drawer sobre `<dialog>` nativo.
- Que cada commit compile y pase los tests por sí solo.

### Qué corregí o decidí yo

- **Stack y reglas:** cambié npm por **pnpm**, pedí **Bootstrap** y una capa de componentes
  reutilizables, y añadí las reglas no negociables. Pedí usar una **librería de iconos**.
- **Diseño:** le pasé una propuesta propia (lista de usuarios con avatares, cards blancas sobre fondo
  gris) y definí el maestro-detalle 4/8, el formulario en un **panel lateral** estrecho con los campos
  en una card, que todo se **ajuste al alto de la pantalla con scroll por panel** y el nombre
  "Usuarios".
- **Paginación de publicaciones:** decidí paginarlas en el cliente sobre la lista en memoria, entre las
  dos opciones que me planteó.
- **Historial:** commits pequeños con Conventional Commits y sin la línea de coautor de la IA.

### Errores de la IA que detecté

- **Lista de usuarios centrada:** con pocos resultados, la lista aparecía en mitad de la card. Era un
  `.card-body` de Bootstrap con `flex: 1` que crecía y empujaba la lista hacia abajo; la IA no lo
  había previsto y lo detecté en el navegador.
- **Scroll al buscar:** al buscar, la lista conservaba el scroll a mitad y los resultados no se veían.
  Se corrigió haciendo que la zona de scroll empiece arriba en cada búsqueda y en cada página de
  publicaciones.
