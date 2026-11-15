# CLAUDE.md — reactjs-technical-test

SPA en React + TypeScript que consume https://jsonplaceholder.typicode.com.

> Este archivo **prevalece** sobre el `CLAUDE.md` del directorio padre en lo que se contradiga

## ⛔ Reglas no negociables

Ninguna tarea justifica saltarse estas reglas. Si una parece imposible de cumplir, **parar y preguntar**.

### Dependencias
1. **Package manager: pnpm.** Nunca npm ni yarn; no crear `package-lock.json` ni `yarn.lock`.
2. **Solo las librerías listadas en [Stack](#stack).** Prohibido añadir cualquier otra (runtime o dev)
   sin aprobación explícita. Utilidades pequeñas (debounce, formateo, ids) se implementan a mano.

### Formularios
3. **Todo formulario se construye con React Hook Form + Zod** (`zodResolver`). Sin `useState` por campo,
   sin validación manual en `onSubmit`.
4. El esquema Zod es la única fuente de verdad: los tipos del formulario salen de `z.infer`.
5. Errores de validación inline por campo (`invalid-feedback`), nunca en toast.

### Búsqueda, paginación y ordenación (server side, siempre juntas)
6. **Búsqueda, paginación y ordenación de listados se hacen en el servidor**: viajan como query params
   a la API. Prohibido filtrar, paginar u ordenar en cliente el resultado de un listado paginado
   (ordenar solo la página visible da un orden falso).
7. Los tres van **siempre juntos**: si un listado se pagina en servidor, su búsqueda y su ordenación
   también son server side.
8. Todo el estado del listado (`search`, `page`, `limit`, `sort`, `order`) forma parte de la
   **query key** (`userKeys.list(params)`) y se persiste en la URL (`?q=&page=&limit=&sort=&order=`).
9. La búsqueda se envía con **debounce** (~300 ms, hook propio `useDebouncedValue`).
   Cambiar búsqueda, orden o tamaño de página ⇒ volver a `page=1`.
10. Usar `placeholderData: keepPreviousData` para no vaciar la lista mientras llega la nueva respuesta.
11. En `DataTable` con datos server side ⇒ `manualFiltering`, `manualPagination` y `manualSorting`
    en `true`, y `rowCount` desde `X-Total-Count`.
12. **Excepción documentada**: los posts de un usuario **no se paginan** (ver [API y datos](#api-y-datos)).

### Endpoints y manejo de errores
13. **Cada endpoint se define en `src/api/` y siempre pasa por `request()` / `requestPaginated()`**:
    nunca `fetch` directo en componentes, hooks ni features.
14. Todo endpoint: valida la respuesta con su **esquema Zod**, acepta `signal`, y ante cualquier fallo
    (red, timeout, HTTP no-ok, parseo, cabecera `X-Total-Count` ausente o inválida) lanza **`ApiError`**.
    Nunca devolver `undefined`/`null` para señalar un error ni tragarse excepciones.
15. Mensajes al usuario solo vía `getErrorMessage(error)`.
16. **Toda vista que consume datos muestra los estados loading, error (con reintentar) y empty.**

### Responsive
17. **Toda vista es responsive y mobile-first**, verificada al menos en 375 px, 768 px y ≥ 992 px.
18. Solo con grid/utilidades de Bootstrap; sin media queries en JS ni anchos fijos en px.
    Ningún scroll horizontal de página.

### Componentes y arquitectura
19. **Reutilizar siempre `components/ui/`**: en `features/` prohibido usar `<button>`, `<input>`,
    `<textarea>`, `<table>` crudos si existe su componente en `ui/`. Si falta uno, se crea en `ui/`.
20. `ui/` no contiene lógica de dominio (no conoce usuarios ni posts).
21. `sonner` solo se importa en `ui/toast`; el resto usa `notify`.
22. Sin `useEffect` para fetching ni para derivar estado.

### TypeScript y calidad
23. TypeScript `strict`. Prohibido `any`, `as unknown as`, `@ts-ignore` y `eslint-disable` sin
    comentario que lo justifique.
24. Tipos de dominio derivados de Zod; no duplicar interfaces.
25. Antes de dar una tarea por terminada: `pnpm typecheck` y `pnpm lint` sin errores.
26. Todo componente de `ui/` y todo flujo de `features/` nuevo lleva su test. Los tests **nunca**
    llaman a la red real: siempre MSW.

### Seguridad y accesibilidad
27. Base URL y config en variables `VITE_*` con `.env.example`; nunca hardcodear URLs ni commitear `.env`.
28. Accesibilidad obligatoria: `label` en cada control, `aria-describedby` en errores,
    `role="alert"` en errores, foco visible, navegación por teclado en filas clicables.
29. No renderizar HTML de la API con `dangerouslySetInnerHTML`.

### Datos con una API que no persiste
30. **La caché de posts es la fuente de verdad durante la sesión**: las queries de posts usan
    `staleTime: Infinity`, `gcTime: Infinity` y `refetchOnWindowFocus: false`. Un refetch borraría los
    posts creados, porque JSONPlaceholder no los guarda.
31. Tras crear un post, **solo `setQueryData`**: prohibido `invalidateQueries`/`refetch` sobre los posts
    (tendría el mismo efecto). Documentarlo en el README.
32. **El detalle nunca depende de los datos del listado**: `/users/:userId` carga el usuario con su
    propia query (`GET /users/:id`, `userKeys.detail(id)`), ya que con paginación el usuario puede no
    estar en la página visible (deep link, recarga).
33. El param `:userId` se valida con Zod (entero positivo). Inválido (`/users/abc`) o 404
    (`/users/999`) ⇒ estado "Usuario no encontrado" con enlace al listado, nunca pantalla rota.

### Comportamiento de formularios
34. Los esquemas Zod **recortan espacios y acotan longitud**: `title` `trim().min(1).max(100)`,
    `body` `trim().min(1).max(500)`. Los mensajes de error, en español, viven en el esquema.
35. Campos con límite muestran contador de caracteres (vía `hint` de `Input`/`Textarea`).
36. Envío correcto ⇒ `reset()` del formulario y, en móvil, se colapsa. Envío fallido ⇒ se conservan
    los valores. Error de validación ⇒ foco en el primer campo inválido (`shouldFocusError`).
37. Durante el envío el botón usa `isLoading`: **doble envío imposible** (cubierto por test).

### Git
38. Conventional Commits, commits pequeños y atómicos.

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
| Estilos | `bootstrap` 5.3 **solo CSS** (sin JS, sin `react-bootstrap`, sin SCSS) + variables CSS en `theme.css` |
| Server state | `@tanstack/react-query` v5 (`queryOptions` + fábricas de query keys) |
| Tablas | `@tanstack/react-table` |
| Routing | `react-router` |
| Formularios | `react-hook-form` + `zod` + `@hookform/resolvers` |
| HTTP | `fetch` nativo con cliente propio (sin Axios ni ky) |
| Toasts | `sonner` (envuelto en `ui/toast`) |
| Iconos | `lucide-react` (importar iconos sueltos: `import { Search } from 'lucide-react'`) |
| Tests | `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `msw` |
| Calidad | `eslint` (+ `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`, `globals`), `prettier` |
| Tooling | `typescript`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`, `@types/node`, `@testing-library/dom` |

Versiones mayores instaladas (revisar su API antes de usarla, no asumir versiones antiguas):
React 19.3, React Router **8**, TanStack Query 5, TanStack Table **9**, Zod **4**, RHF 7,
`@hookform/resolvers` 7, Sonner 2, Bootstrap 5.3, Vite **8**, Vitest **5**, MSW **3**, ESLint **10**.
**TypeScript fijado a `~6.0`**: `typescript-eslint` 8 no soporta TS 7 (peer `<6.1.0`). No actualizar
hasta que lo soporte.

## Estructura

```
src/
  app/                 # providers (QueryClient, Router), rutas, App.tsx
  api/
    client.ts          # request() y requestPaginated(): baseURL, JSON, ApiError, signal, timeout, Zod
    errors.ts          # ApiError { status, message, cause } + getErrorMessage()
    schemas.ts         # Zod: UserSchema, PostSchema, PostInputSchema
    types.ts           # ListParams { search, page, limit, sort, order }, Paginated<T> { data, total }
    users.ts           # getUsers(params: ListParams, signal): Promise<Paginated<User>>
                       # getUserById(id, signal): Promise<User>  (404 ⇒ ApiError status 404)
    posts.ts           # getPostsByUser(userId, signal), createPost(input)
  features/
    users/             # UsersPage, columns.tsx, queries.ts
    posts/             # UserPostsPanel, PostList, PostForm, queries.ts
  components/
    ui/                # piezas reutilizables, sin lógica de dominio
    layout/            # estructura de página
  hooks/               # hooks genéricos (useDebouncedValue, useListSearchParams)
  lib/                 # utilidades puras (escapeRegExp)
  styles/theme.css
  test/                # setup, handlers MSW, renderWithProviders
```

Alias de importación `@/` → `src/`. Cada carpeta de `ui/` y `layout/` exporta desde un `index.ts`.

## Capa `ui/` (componentes propios sobre clases de Bootstrap)

Todos extienden las props nativas del elemento HTML y son accesibles.

- **Button**: `variant`, `size`, `isLoading`, `loadingText?`. En loading: spinner a la izquierda del
  texto, `disabled`, `aria-busy`.
- **Spinner**: `size`, `label` (visually-hidden).
- **FormField** (interno): label + control + error + hint; `useId`, `aria-describedby`, `aria-invalid`.
- **Input** / **Textarea**: `label`, `error?`, `hint?`; `ref` como prop (React 19), compatible con `register()`.
- **SearchInput**: Input con icono, botón limpiar e indicador de búsqueda en curso.
- **DataTable\<T\>**: `data`, `columns: ColumnDef<T>[]`, `isLoading`, `isFetching`, `error`, `onRetry`,
  `emptyMessage`, `onRowClick`, `getRowId`, `selectedRowId`, y estado controlado server side:
  `rowCount`, `pagination` + `onPaginationChange`, `sorting` + `onSortingChange`.
  `manualFiltering`/`manualPagination`/`manualSorting`, estados loading/error/empty internos,
  cabeceras ordenables con `aria-sort`, filas navegables por teclado, columnas ocultables vía
  `meta.className` (`d-none d-md-table-cell`). Renderiza `Pagination` en el pie.
- **Pagination**: `page`, `pageCount`, `onPageChange`, `pageSize`, `pageSizeOptions`, `onPageSizeChange`,
  `total`. Clases `pagination` de Bootstrap, `<nav aria-label>`, `aria-current="page"`, botones
  anterior/siguiente deshabilitados en los extremos. En móvil: solo anterior/siguiente + "Página X de Y".
- **Card**, **Alert/ErrorState** (`title`, `message`, `onRetry`, `role="alert"`), **EmptyState**,
  **Skeleton** (placeholders de Bootstrap `placeholder-glow`).
- **toast/**: `<Toaster />` (Sonner `unstyled` + clases Bootstrap) y `notify.success|error`.

## Capa `layout/`

- **AppLayout**: navbar, skip-link, `<main className="container-xl py-4">` con `<Outlet/>`, footer, `<Toaster/>`.
- **PageHeader**: título, subtítulo, slot de acciones.
- **SplitView**: `row g-4` con `aside` (col-lg-5) y `main` (col-lg-7); recibe qué panel está activo en móvil.
- **BackLink**: "← Volver", solo móvil (`d-lg-none`).

## Rutas y responsive

```tsx
<Route element={<AppLayout />} errorElement={<RouteError />}>
  <Route index element={<Navigate to="/users" replace />} />
  <Route path="users" element={<UsersPage />}>
    <Route index element={<SelectUserHint />} />
    <Route path=":userId" element={<UserPostsPanel />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Route>
```

- **≥ lg**: maestro-detalle en dos columnas; panel de detalle `position-sticky`.
- **< lg**: una vista cada vez según la URL (lista o detalle), resuelto con clases
  `d-none d-lg-block`. Formulario colapsable tras "+ Nueva publicación".
- Los params del listado (`?q=&page=&limit=&sort=&order=`) se conservan al navegar al detalle y volver.
- Publicaciones en **cards**, no en tabla.

## API y datos

- Base URL en `import.meta.env.VITE_API_URL`.
- Servicios en `api/` son funciones puras sin React; los hooks viven en `features/*/queries.ts`.
- **Búsqueda de usuarios**: `GET /users?name_like=<término>` (verificado contra la API real):
  - Filtra **solo por `name`**, coincidencia parcial y sin distinguir mayúsculas (`lean`, `GRAHAM` ✅).
  - **Es una regex en el servidor** → escapar el término con un `escapeRegExp` propio antes de enviarlo.
    Sin escapar: `.` devuelve todos los usuarios y `(` provoca un **HTTP 500**.
  - Término vacío ⇒ no enviar el param (`GET /users`).
  - Descartado `q=`: es búsqueda full-text en **todos** los campos (p. ej. `q=gwenborough` encuentra
    por ciudad), no cumple "búsqueda por nombre".
  - Documentar esta decisión en el README.
- **Paginación y ordenación de usuarios** (verificado contra la API real):
  - `_page=<n>&_limit=<n>` (1-based) y `_sort=<campo>&_order=asc|desc`; combinables con `name_like`.
  - Total en la cabecera **`X-Total-Count`** (respeta el filtro: `name_like=e` ⇒ 9). CORS la expone
    (`access-control-expose-headers: X-Total-Count, Link`).
  - `requestPaginated()` lee y valida `X-Total-Count` y devuelve `{ data, total }`.
  - Página por defecto `limit=5` (para que la paginación sea visible con 10 usuarios); opciones 5 / 10.
  - Columnas ordenables: `name`, `username`, `email`. Por defecto `sort=name&order=asc`.
  - Params de URL inválidos (página < 1, límite no permitido, campo de orden no permitido) se
    normalizan a los valores por defecto validándolos con Zod en `useListSearchParams`.
- **Posts sin paginar**: son 10 por usuario y paginar rompería el requisito de que el post creado
  aparezca en la lista (solo estaría en la página 1 y `total`/`pageCount` quedarían inconsistentes).
  Documentarlo en el README.
- **Crear post**: JSONPlaceholder devuelve siempre `id: 101` → generar id en cliente
  (`crypto.randomUUID()`) para evitar keys duplicadas. Insertar al principio con
  `queryClient.setQueryData(postKeys.byUser(userId), …)`. Documentarlo en el README.

## Feedback al usuario

| Caso | Mecanismo |
|---|---|
| Error al cargar (queries) | Inline: `ErrorState` + "Reintentar" (`refetch`) |
| Carga inicial | Skeletons; spinner solo en botones |
| Refetch de búsqueda | Datos anteriores visibles + indicador en `SearchInput` |
| Post creado | Toast success + resaltado breve del nuevo post |
| Error al crear | Toast error; el formulario conserva lo escrito |
| Validación | Inline por campo |

Los toasts se disparan en `onSuccess`/`onError` de `useCreatePost`, no en el componente.

## Tests (Vitest + RTL + MSW)

Consultar por rol/label, no por clases ni test-ids. Mínimo:

1. `Button`: muestra spinner y queda deshabilitado con `isLoading`.
2. `Input`: muestra el error y lo enlaza vía `aria-describedby`.
3. Búsqueda: escribir en el buscador dispara la request con `name_like` (término escapado) y muestra
   el resultado del servidor.
4. Estados: loading visible y error con reintento cuando MSW devuelve 500.
5. Formulario: errores con campos vacíos (y solo espacios); envío válido añade el post a la lista,
   resetea el formulario y no permite doble envío.
6. `request()`: lanza `ApiError` ante HTTP no-ok y ante respuesta que no cumple el esquema.
7. Paginación y orden: cambiar de página / ordenar por columna dispara la request con
   `_page`/`_limit`/`_sort`/`_order` y actualiza la URL; buscar resetea a página 1.
8. Detalle: deep link a un usuario fuera de la página visible carga sus datos; `/users/999` y
   `/users/abc` muestran "Usuario no encontrado".
9. Persistencia en sesión: un post creado sigue en la lista tras ir a otro usuario y volver.

## Comandos

```bash
pnpm dev         # servidor de desarrollo
pnpm test        # Vitest
pnpm lint        # ESLint
pnpm typecheck   # tsc -b (noEmit)
pnpm format      # Prettier --write (format:check para CI)
```

## README / uso de IA

Ir anotando durante el desarrollo, en una sección del README, ejemplos reales de:
qué se le pidió a la IA, qué se aceptó y qué se corrigió (y por qué).

## Fuera de alcance (ir a "qué haría con más tiempo")

Actualizaciones optimistas con rollback, `MutationCache.onError` global,
E2E con Playwright, i18n, interruptor de modo oscuro, CI con GitHub Actions (si no da tiempo).
