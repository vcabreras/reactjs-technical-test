# CLAUDE.md — reactjs-technical-test

SPA **Usuarios** en React + TypeScript que consume https://jsonplaceholder.typicode.com.

> Este archivo **prevalece** sobre el `CLAUDE.md` del directorio padre en lo que se contradiga

## ⛔ Reglas no negociables

Ninguna tarea justifica saltarse estas reglas. Si una parece imposible de cumplir, **parar y preguntar**.

### Dependencias
1. **Package manager: pnpm.** Nunca npm ni yarn; no crear `package-lock.json` ni `yarn.lock`.
2. **Solo las librerías listadas en [Stack](#stack).** Prohibido añadir cualquier otra (runtime o dev)
   sin aprobación explícita. Utilidades pequeñas (debounce, formateo, ids) se implementan a mano.
3. **Sin código muerto**: lo que deja de usarse (componentes, exports, CSS, dependencias) se elimina
   y se quita también de este archivo.

### Formularios
4. **Todo formulario se construye con React Hook Form + Zod** (`zodResolver`). Sin `useState` por campo,
   sin validación manual en `onSubmit`.
5. El esquema Zod es la única fuente de verdad: los tipos del formulario salen de `z.output`/`z.infer`.
6. Errores de validación inline por campo (`invalid-feedback`), nunca en toast.

### Listados: búsqueda y orden en servidor, paginación solo de posts
7. **La búsqueda y la ordenación de usuarios se hacen en el servidor**: `name_like` y
   `_sort=name&_order=asc` (orden fijo, sin selector). Prohibido filtrar u ordenar usuarios en cliente.
8. **Los usuarios no se paginan**: se piden todos los que cumplen la búsqueda (10 en JSONPlaceholder)
   y la lista hace scroll propio en escritorio.
9. El término de búsqueda forma parte de la **query key** (`userKeys.list({ search })`) y se persiste
   en la URL (`?q=`, hook `useSearchParamState`, reemplazando la entrada del historial).
10. La búsqueda se envía con **debounce** (~300 ms, hook propio `useDebouncedValue`).
11. Usar `placeholderData: keepPreviousData` para no vaciar la lista mientras llega la nueva respuesta.
12. **Solo se paginan las publicaciones**, en cliente (5 por página), sobre la lista completa
    **en memoria** (caché de TanStack Query): los posts del servidor más los creados con
    `setQueryData`, que van primero. El total y las páginas incluyen siempre los creados.
    Ver [API y datos](#api-y-datos).
13. Si en el futuro se pagina un listado en servidor, su búsqueda y su ordenación también lo serán
    (paginar en servidor y ordenar/filtrar en cliente da resultados falsos).

### Endpoints y manejo de errores
14. **Cada endpoint se define en `src/api/` y siempre pasa por `request()`**:
    nunca `fetch` directo en componentes, hooks ni features.
15. Todo endpoint: valida la respuesta con su **esquema Zod**, acepta `signal`, y ante cualquier fallo
    (red, timeout, cancelación, HTTP no-ok, parseo, entrada inválida) lanza **`ApiError`**.
    Nunca devolver `undefined`/`null` para señalar un error ni tragarse excepciones.
16. Mensajes al usuario solo vía `getErrorMessage(error)`.
17. **Toda vista que consume datos muestra los estados loading, error (con reintentar) y empty.**

### Responsive
18. **Toda vista es responsive y mobile-first**, verificada al menos en 375 px, 768 px y ≥ 992 px.
    En escritorio la app ocupa **solo el alto de la pantalla**: usuarios y publicaciones hacen scroll
    propio si no caben; en móvil se mantiene el scroll de página.
19. Primero grid y utilidades de Bootstrap. El CSS propio vive en `theme.css`, usa variables y
    breakpoints de Bootstrap y se justifica con un comentario. Nunca media queries en JS ni anchos
    fijos en px. Ningún scroll horizontal de página.

### Componentes y arquitectura
20. **Reutilizar siempre `components/ui/`**: en `features/` prohibido usar `<button>`, `<input>`,
    `<textarea>` o `<dialog>` crudos si existe su componente en `ui/`. Si falta uno, se
    crea en `ui/` (con test).
21. `ui/` no contiene lógica de dominio (no conoce usuarios ni posts) ni importa de `api/`.
22. `sonner` solo se importa en `ui/Toast`; el resto usa `notify`.
23. Sin `useEffect` para fetching ni para derivar estado (solo para sincronizar con APIs externas:
    temporizadores, `<dialog>`).

### TypeScript y calidad
24. TypeScript `strict` (+ `noUncheckedIndexedAccess`). Prohibido `any`, `as unknown as`,
    `@ts-ignore`, non-null assertions (`!`) y `eslint-disable` sin comentario que lo justifique.
25. Tipos de dominio derivados de Zod; no duplicar interfaces.
26. Antes de dar una tarea por terminada: `pnpm typecheck`, `pnpm lint` y `pnpm format:check` sin errores.
27. Todo componente de `ui/` y todo flujo de `features/` nuevo lleva su test (los internos, como
    `FormField`, se prueban a través de los componentes que los usan: `Input`, `Textarea`). Los tests
    **nunca** llaman a la red real: siempre MSW (`onUnhandledFrame: 'error'`).

### Seguridad y accesibilidad
28. Base URL y config en variables `VITE_*` con `.env.example`; nunca hardcodear URLs ni commitear `.env`.
29. Accesibilidad obligatoria: `label` en cada control, `aria-describedby` en errores,
    `role="alert"` en errores de carga, foco visible, todo lo interactivo es un enlace o botón nativo
    (accesible por teclado), `aria-current` en el elemento seleccionado.
30. No renderizar HTML de la API con `dangerouslySetInnerHTML`.

### Datos con una API que no persiste
31. **La caché de posts es la fuente de verdad durante la sesión**: las queries de posts usan
    `staleTime: Infinity`, `gcTime: Infinity` y `refetchOnWindowFocus: false`. Un refetch borraría los
    posts creados, porque JSONPlaceholder no los guarda.
32. Tras crear un post, **solo `setQueryData`**: prohibido `invalidateQueries`/`refetch` sobre los posts
    (tendría el mismo efecto). El formulario solo existe con la lista ya en caché.
33. **El detalle nunca depende de los datos del listado**: `/users/:userId` carga el usuario con su
    propia query (`GET /users/:id`, `userKeys.detail(id)`), en paralelo con sus posts, ya que el
    usuario puede no estar en la lista visible (búsqueda activa, deep link, recarga).
34. El param `:userId` se valida con Zod (entero positivo). Inválido (`/users/abc`) o 404
    (`/users/999`) ⇒ estado "Usuario no encontrado" con enlace al listado, nunca pantalla rota.

### Comportamiento de formularios
35. Los esquemas Zod **recortan espacios y acotan longitud**: `title` `trim().min(1).max(100)`,
    `body` `trim().min(1).max(500)`. Los mensajes de error, en español, viven en el esquema.
36. Campos con límite muestran contador de caracteres (prop `characterCount` de `Input`/`Textarea`,
    calculado con `useWatch`). Sin `maxLength` nativo: el contador y el error de Zod avisan.
37. El formulario de post vive en un `Drawer` (panel lateral derecho) que abre "Nueva publicación".
    Envío correcto ⇒ `reset()`, se cierra el panel y se vuelve a la página 1. Envío fallido ⇒ el panel
    sigue abierto y se conservan los valores. Error de validación ⇒ foco en el primer campo inválido.
38. Durante el envío el botón usa `isLoading`: **doble envío imposible** (cubierto por test).

### Git
39. Conventional Commits, commits pequeños y atómicos.

---

## Requisitos del enunciado

1. Lista de usuarios con búsqueda por nombre.
2. Al elegir un usuario: ver sus publicaciones y crear una nueva con formulario validado
   (título y texto obligatorios). La API no persiste; basta con que la nueva aparezca en la lista.
3. Estados de carga y de error visibles.
4. Mínimo 3 tests con Vitest + Testing Library.
5. README: cómo ejecutar, decisiones, qué haría con más tiempo y uso de la IA
   (qué se pidió, qué se aceptó, qué se corrigió).

## Stack

Lista cerrada (ver regla 2).

| Área | Librería |
|---|---|
| Base | Vite + React 19 + TypeScript `strict` |
| Package manager | pnpm |
| Estilos | `bootstrap` 5.3 **solo CSS** (sin JS, sin `react-bootstrap`, sin SCSS) + `styles/theme.css` |
| Server state | `@tanstack/react-query` v5 (`queryOptions` + fábricas de query keys) |
| Routing | `react-router` (data router: `createBrowserRouter`) |
| Formularios | `react-hook-form` + `zod` + `@hookform/resolvers` |
| HTTP | `fetch` nativo con cliente propio (sin Axios ni ky) |
| Toasts | `sonner` (envuelto en `ui/Toast`) |
| Iconos | `lucide-react` (importar iconos sueltos: `import { Search } from 'lucide-react'`) |
| Tests | `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `msw` |
| Calidad | `eslint` (+ `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`, `globals`), `prettier` |
| Tooling | `typescript`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`, `@types/node`, `@testing-library/dom` |

Versiones mayores instaladas (revisar su API en `node_modules` antes de usarla, no asumir versiones
antiguas): React 19.3, React Router **8**, TanStack Query 5, Zod **4**, RHF 7, `@hookform/resolvers` 7,
Sonner 2, lucide-react 1, Bootstrap 5.3, Vite **8**, Vitest **5**, MSW **3**, ESLint **10**.
**TypeScript fijado a `~6.0`**: `typescript-eslint` 8 no soporta TS 7 (peer `<6.1.0`). No actualizar
hasta que lo soporte.

## Estructura

```
src/
  main.tsx               # monta <App/>, importa Bootstrap y theme.css
  app/
    App.tsx              # QueryClient + createBrowserRouter (creados una vez, fuera de React)
    routes.tsx           # appRoutes
    queryClient.ts       # createQueryClient() + shouldRetry
    RouteErrorBoundary.tsx, NotFoundPage.tsx
    AppLoading.tsx       # HydrateFallback: primera carga directa en una ruta diferida
  api/
    client.ts            # request(): baseURL, query params, JSON, ApiError, signal, timeout, Zod
    errors.ts            # ApiError { kind, status, cause, isNotFound } + isApiError + getErrorMessage()
    schemas.ts           # Zod: UserSchema, PostSchema (id → string), PostInputSchema
    users.ts             # getUsers({ search }, signal), getUserById(id, signal)
    posts.ts             # getPostsByUser(userId, signal), createPost(input, signal)
  features/
    users/               # UsersPage (+ SelectUserHint), UsersListPanel, UserList, queries
    posts/               # UserPostsPanel, PostList, PostForm, queries (+ useCreatePost)
  components/
    ui/                  # piezas reutilizables, sin lógica de dominio (barrel index.ts)
    layout/              # estructura de página (barrel index.ts)
  hooks/                 # useDebouncedValue, useSearchParamState
  lib/                   # utilidades puras: cx, escapeRegExp
  styles/theme.css       # CSS propio sobre variables de Bootstrap
  test/
    setup.ts             # jest-dom, MSW y stubs de jsdom (scrollTo, scrollIntoView, <dialog>,
                         # Pointer Capture)
    msw/                 # fixtures, handlers (réplica de json-server), server
    render.tsx           # renderRoute({ path }) con router en memoria y QueryClient de test
```

Alias de importación `@/` → `src/`. Cada componente vive en su carpeta con su test
(`ui/Button/Button.tsx` + `Button.test.tsx`).

## Capa `ui/` (componentes propios sobre clases de Bootstrap)

Todos extienden las props nativas del elemento HTML cuando envuelven uno y son accesibles.

- **Button**: `variant`, `size`, `isLoading`, `loadingText?`. En loading: spinner a la izquierda del
  texto, `disabled` (gana a la prop `disabled`), `aria-busy`. `type="button"` por defecto.
- **Spinner**: `size`, `label` (visually-hidden), `decorative` (`aria-hidden`).
- **FormField** (interno, no exportado): label + control + error + hint + contador; `useId`,
  `aria-invalid` y `aria-describedby` combinado (error, hint, contador, propio).
- **Input** / **Textarea**: `label`, `hideLabel`, `error`, `hint`, `characterCount`; `ref` como prop
  (React 19), compatibles con `register()`.
- **SearchInput**: controlado (`value`, `onValueChange`), icono, botón limpiar (también Escape) que
  devuelve el foco e indicador `isSearching`. El debounce lo gestiona quien lo usa.
- **Pagination**: `page`, `pageCount`, `onPageChange`, `total`, `pageSize`, `label`.
  `<nav aria-label>` (nombre distinto si hay varias en la página), `aria-current="page"`,
  anterior/siguiente deshabilitados en los extremos, resumen "Mostrando X–Y de Z" (`aria-live`).
  Con una página oculta la navegación; sin resultados no renderiza nada. En móvil: solo
  anterior/siguiente + "Página X de Y". Solo la usan las publicaciones.
- **ErrorState** (`role="alert"`, `title`, `message`, `onRetry`, `isRetrying`), **EmptyState**
  (`role="status"`, `title`, `description`, `icon`, `action`), **Skeleton** / **SkeletonGroup**
  (barras `aria-hidden` dentro de un `role="status"` con etiqueta).
- **Avatar**: iniciales de las dos primeras palabras (`getInitials`), decorativo.
- **Drawer**: panel lateral derecho modal sobre `<dialog>` nativo con el aspecto de `offcanvas-end`
  (sin JS de Bootstrap): foco atrapado, Escape, click en backdrop y devolución del foco. El contenido
  solo se monta abierto.
- **Toast/**: `<Toaster />` (Sonner `unstyled` + `alert` de Bootstrap) y `notify.success|error|dismiss`.

## Capa `layout/`

- **AppLayout**: skip-link, navbar blanca (marca "Usuarios") con `<nav aria-label="Principal">`,
  `<main className="container-xl pt-4 pb-5">` con `<Outlet/>`, footer, `<Toaster/>`, `<ScrollRestoration/>`.
  En escritorio ocupa `100dvh` (`.app-shell`) y el `main` reparte el alto restante.
- **PageHeader**: título (`h1`/`h2`), subtítulo y slot de acciones.
- **SplitView**: `row g-4` con `aside` (col-lg-4, usuarios) y `main` (col-lg-8, detalle); en escritorio
  ocupa el alto disponible; `activePanel` decide qué se ve por debajo de `lg`.
- **BackLink**: "← Volver", solo por debajo de `lg` (`d-lg-none`).

## Rutas y responsive

```ts
appRoutes = [{
  Component: AppLayout, ErrorBoundary: RouteErrorBoundary,      // fallo del propio layout
  HydrateFallback: AppLoading,                                   // primera carga en ruta diferida
  children: [{
    ErrorBoundary: RouteErrorBoundary,                           // error de página: mantiene navbar/footer
    children: [
      { index: true, element: <Navigate to="/users" replace /> },
      { path: 'users', Component: UsersPage, children: [
        { index: true, Component: SelectUserHint },
        { path: ':userId', lazy: () => import('@/features/posts/UserPostsPanel') … },  // diferida
      ]},
      { path: '*', Component: NotFoundPage },
    ],
  }],
}]
```

- **Carga diferida**: `/users/:userId` (formulario, React Hook Form, Drawer) va en su propio chunk.
  `vite.config.ts` agrupa React, React Router y TanStack en `react-vendor` (solo esas: un grupo
  genérico de `node_modules` arrastraría a la carga inicial las librerías de la ruta diferida).
  Ningún chunk debe superar los 500 kB.
- **Misma vista en móvil y escritorio**: los usuarios son siempre una lista (avatar + nombre + @usuario).
- **≥ lg**: maestro-detalle 4/8 limitado al alto de la pantalla. Clases en `theme.css`:
  `.app-shell` → `.fill-page` → `.split-view` → `.fill-panel` (partes fijas con `flex-shrink-0`) y
  `.fill-panel__scroll` (la zona que hace scroll). Usuarios: buscador fijo y lista con scroll.
  Detalle: cabecera y paginación fijas, lista de posts con scroll.
- **< lg**: una vista cada vez según la URL (lista o detalle) con `d-none d-lg-block`.
- La búsqueda (`?q=`) se conserva al ir al detalle y volver.
- **El scroll vuelve arriba**: la zona de scroll lleva una `key` ligada a la búsqueda (usuarios) y a
  la página (publicaciones), así que se vuelve a montar y empieza arriba. En móvil, al cambiar de
  página de publicaciones, `scrollIntoView` lleva la vista al contador.
- Título de pestaña con `<title>` de React 19 (uno por vista: "Usuarios", "<nombre> · Usuarios"…;
  el listado solo lo pone sin usuario seleccionado).

## Diseño visual

- Fondo `--bs-tertiary-bg` con cards blancas `border-0 shadow-sm`.
- Sin cabecera visible en `/users`: la marca de la navbar ya dice "Usuarios"; la página mantiene un
  `<h1 className="visually-hidden">Usuarios</h1>` para lectores de pantalla.
- `<main>` con `pt-4 pb-5`: separación extra entre el contenido y el footer.
- Card de usuarios: buscador y `list-group` con el seleccionado `active` (azul, avatar blanco).
  Sin selector de orden ni paginación.
- Detalle: card con nombre (`h2`), "email · empresa" y botón "Nueva publicación"; contador
  "N publicaciones" y posts en cards con título `text-capitalize`. El post creado se resalta brevemente.
- Drawer de nueva publicación estrecho (`min(100vw, 26rem)`) con fondo gris y el formulario dentro
  de una card blanca.
- En cards que ocupan todo el alto, las partes fijas (p. ej. el `.card-body` del buscador) llevan
  `flex-grow-0`: `.card-body` trae `flex: 1 1 auto` y empujaría el contenido al centro.
- Respetar `prefers-reduced-motion` en animaciones.

## API y datos

- Base URL en `import.meta.env.VITE_API_URL`.
- Servicios en `api/` son funciones puras sin React; los hooks y `queryOptions` viven en
  `features/*/queries.ts`.
- **QueryClient**: `shouldRetry` reintenta **una vez** solo fallos transitorios (red, timeout, 5xx);
  nunca 4xx, parse, validation, aborted ni config. Mutaciones sin reintento.
- **Búsqueda de usuarios**: `GET /users?name_like=<término>` (verificado contra la API real):
  - Filtra **solo por `name`**, coincidencia parcial y sin distinguir mayúsculas (`lean`, `GRAHAM` ✅).
  - **Es una regex en el servidor** → escapar el término con `escapeRegExp` antes de enviarlo.
    Sin escapar: `.` devuelve todos los usuarios y `(` provoca un **HTTP 500**.
  - Término vacío ⇒ no enviar el param (`GET /users`).
  - Descartado `q=`: es búsqueda full-text en **todos** los campos (p. ej. `q=gwenborough` encuentra
    por ciudad), no cumple "búsqueda por nombre".
- **Ordenación de usuarios**: fija por nombre en el servidor (`_sort=name&_order=asc`, verificado
  contra la API real). Sin paginación de usuarios (la API admite `_page`/`_limit` y `X-Total-Count`,
  pero se descartó: la lista es corta y hace scroll propio).
- **Posts paginados en cliente sobre la lista en memoria** (regla 12):
  - Los posts creados solo existen en memoria (la API no los persiste), así que paginar en servidor
    no cuadraría `total`/`pageCount` con ellos.
  - Se pide **una vez** la lista completa del usuario (`GET /posts?userId=`, 10 en JSONPlaceholder);
    los creados se añaden al principio de esa misma lista en caché con `setQueryData` (regla 32).
  - La paginación se calcula sobre esa lista en memoria: `total = posts.length` (servidor + creados),
    `pageCount = ceil(total / 5)` y la página visible es un `slice`. Sin estado duplicado: la página
    se acota si la lista encoge.
  - Crear un post vuelve a la página 1 (donde aparece). La página es estado local del panel y se
    reinicia al cambiar de usuario (`key={userId}`).
- **Crear post**: JSONPlaceholder devuelve siempre `id: 101` → `createPost` lo sustituye por
  `crypto.randomUUID()` para evitar keys duplicadas. `PostSchema` normaliza el `id` a string para que
  posts del servidor y creados compartan tipo.
- Documentar en el README: búsqueda con `name_like`, posts en memoria, id generado en cliente.

## Feedback al usuario

| Caso | Mecanismo |
|---|---|
| Error al cargar (queries) | Inline: `ErrorState` + "Reintentar" (`refetch`) |
| Carga inicial | Skeletons; spinner solo en botones y en el buscador |
| Refetch de búsqueda | Lista anterior visible y atenuada + indicador en `SearchInput` |
| Sin resultados | `EmptyState` (+ "Ver todos los usuarios" si hay búsqueda) |
| Post creado | Toast success + resaltado breve del nuevo post |
| Error al crear | Toast error (id fijo, no se apilan); el panel sigue abierto y conserva lo escrito |
| Validación | Inline por campo |

Los toasts se disparan en `onSuccess`/`onError` de `useCreatePost`, no en el componente.

## Tests (Vitest + RTL + MSW)

Consultar por rol/label/texto, no por clases ni test-ids (excepción: elementos solo visuales con
`aria-hidden`, documentada en el test). `renderRoute({ path })` monta las rutas reales. Mínimo:

1. `Button`: muestra spinner y queda deshabilitado con `isLoading`.
2. `Input`: muestra el error y lo enlaza vía `aria-describedby`; funciona con RHF + Zod.
3. Búsqueda: escribir dispara una sola request con `name_like` (debounce, término escapado) y muestra
   el resultado del servidor; el término queda en la URL.
4. Estados: loading visible y error con reintento cuando MSW devuelve 500.
5. Formulario (en el Drawer): errores con campos vacíos (y solo espacios); envío válido añade el post
   a la lista, cierra el panel y no permite doble envío; si falla conserva lo escrito.
6. `request()`: lanza `ApiError` ante HTTP no-ok, red, timeout, cancelación y respuesta que no cumple
   el esquema.
7. Usuarios: se piden todos ordenados por nombre en el servidor (`_sort=name`, sin `_page`) y no hay
   paginación; la búsqueda inicial se lee de la URL.
8. Detalle: deep link a un usuario que no está en la lista visible carga sus datos; `/users/999` y
   `/users/abc` muestran "Usuario no encontrado".
9. Persistencia en sesión: un post creado sigue en la lista tras ir a otro usuario y volver.
10. Paginación de posts en memoria: 5 por página; crear un post vuelve a la página 1 y suma al total.

## Comandos

```bash
pnpm dev            # servidor de desarrollo
pnpm test           # Vitest (test:watch en modo watch)
pnpm lint           # ESLint
pnpm typecheck      # tsc -b (noEmit)
pnpm format         # Prettier --write (format:check para CI)
```

## README / uso de IA

Ir anotando durante el desarrollo, en una sección del README, ejemplos reales de:
qué se le pidió a la IA, qué se aceptó y qué se corrigió (y por qué).

## Fuera de alcance (ir a "qué haría con más tiempo")

Persistir los posts creados (p. ej. `localStorage`), actualizaciones optimistas con rollback, E2E con
Playwright, CI con GitHub Actions y despliegue, modo demo con MSW en el navegador, i18n con
**códigos de error genéricos traducibles** (en lugar de textos en `getErrorMessage` y en los esquemas
Zod), `MutationCache.onError` global, cobertura en CI, interruptor de modo oscuro y, si la lista de
usuarios creciera, paginarla en servidor o virtualizarla.
