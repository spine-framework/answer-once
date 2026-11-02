---
title: Frontend SDK Reference (@core)
audience: developers, agents
kind: reference
verified_against: bc17374
verified_on: 2026-11-02
source_files:
  - config/vite.config.ts
  - config/tsconfig.json
  - .framework/src/lib/api.ts
  - .framework/src/lib/supabase.ts
  - .framework/src/lib/utils.ts
  - .framework/src/lib/registration.ts
  - .framework/src/lib/branding.ts
  - .framework/src/hooks/useAppPath.ts
  - .framework/src/hooks/useApi.ts
  - .framework/src/hooks/useApps.ts
  - .framework/src/contexts/AuthContext.tsx
  - .framework/src/contexts/AppContext.tsx
  - .framework/src/components/ui/
  - .framework/src/components/shared/
  - .framework/src/components/kb/
  - .framework/src/components/layout/
  - .framework/src/types/types.ts
  - .framework/src/types/auth.ts
---

# Frontend SDK Reference (`@core`)

Custom apps write frontend code against the framework's `@core` import
surface — the same tree as `.framework/src`, resolved through the bundled
`.assembled/src`. This page is the contract: what each module exports, what
it is for, and when to reach for it. Ordered by how often real apps use it.

## Import aliases

Defined in `config/vite.config.ts` (build/dev) and `config/tsconfig.json`
(types):

| Alias | Resolves to | Use |
|---|---|---|
| `@core/*` | `.assembled/src/*` (types: `.framework/src/*`) | **Frontend core.** All imports below. |
| `@/*` | `.assembled/src/*` | Same tree as `@core` — prefer `@core` in custom apps for clarity. |
| `@custom/*` | `custom/apps/*` | Cross-app imports; rare. |
| `@shared/*` | `.framework/functions/_shared/*` | **Server-side only** (Netlify/Deno functions). Never import from a React page — it pulls server-only deps into the frontend bundle. |

The loader mounts custom apps via `import.meta.glob('../../../custom/apps/*/index.tsx')`
— only `index.tsx` is the entry point; everything else is imported from it.

## 1. `@core/lib/api` — HTTP client (use this for all API calls)

```ts
import { apiFetch } from '@core/lib/api'
```

| Export | Contract |
|---|---|
| `apiFetch(path, options?) → Promise<Response>` | Authenticated `fetch`. Auto-attaches `Authorization: Bearer <supabase session>` and `X-Account-Id` when set. Adds a `traceparent` header for request tracing. Derives an `x-app-id` hint from the URL's first segment (server validates it against installed apps). Returns the raw `Response` — check `.ok`, then `.json()`. Strips bogus `Bearer null/undefined` headers you pass. On `401` (except `/api/auth` and `/api/admin-data` paths) it fires the registered unauthorized callback. |
| `setAccountId(id \| null)` / `getAccountId()` | Set/read the account ID sent as `X-Account-Id` on subsequent calls. AuthContext sets this on login; apps rarely touch it. |
| `getAuthHeaders() → Promise<Record<string,string>>` | The Bearer + `X-Account-Id` header pair, if you need raw headers (e.g. non-fetch transport). |
| `onUnauthorized(cb) → unsubscribe` | Register a global 401 handler (framework registers the logout redirect). One callback at a time. |

Debug: `localStorage.spine_debug_api = '1'` logs `X-Request-ID` + traceparent per call.

**Do not** call `fetch()` directly against `/api/*` — you'll lose auth,
account scoping, and trace headers. For runtime record CRUD, `apiFetch` +
`/api/admin-data` is the only path (see [admin-data](api/admin-data.md)).

## 2. `@core/hooks/useAppPath` — mount-agnostic navigation (required)

```ts
import { useAppPath } from '@core/hooks/useAppPath'
const appPath = useAppPath()
appPath('/tickets')        // → '/my-app/tickets'  (or '/tickets' when route_prefix === '/')
appPath('/')               // → '/my-app'          (or '/')
```

Returns a function that prepends the current app's `route_prefix` (trailing
slash stripped; `'/'` treated as empty). **All app-internal links and
`navigate()` calls must go through it** — hardcoding `/dashboard` escapes the
app when it is directory-mounted, and breaks differently when it is
root-mounted. Alternatively use relative `path`/`to` inside the app's own
`<Routes>`.

## 3. `@core/components/ui/*` — the component kit

A shadcn-style kit (~60 components) plus framework-level widgets. Import
per component: `import { Button } from '@core/components/ui/button'`.

**Framework widgets** (higher-level, Spine-aware):

| Component | Purpose |
|---|---|
| `DataTable` | Sortable/paginated table |
| `ItemListView`, `ItemCard` | Record list/card rendering |
| `Form`, `field`, `input-group` | Form scaffolding (react-hook-form aligned) |
| `Modal`, `dialog`, `alert-dialog`, `drawer`, `sheet` | Overlays |
| `RichTextEditor` | Rich text input |
| `LoadingSpinner`, `spinner`, `skeleton` | Loading states |
| `chart` | Chart wrappers (recharts) |
| `sonner` | Toast notifications |

**Plain kit** (pick what you need): `accordion`, `alert`, `aspect-ratio`,
`avatar`, `badge`, `breadcrumb`, `button`, `button-group`, `calendar`,
`card`, `carousel`, `checkbox`, `collapsible`, `combobox`, `command`,
`context-menu`, `direction`, `dropdown-menu`, `empty`, `hover-card`,
`input`, `input-otp`, `item`, `kbd`, `label`, `menubar`, `native-select`,
`navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`,
`resizable`, `scroll-area`, `select`, `separator`, `sidebar`, `slider`,
`switch`, `table`, `table-primitives`, `tabs`, `textarea`, `toggle`,
`toggle-group`, `tooltip`.

## 4. `@core/contexts/AuthContext` — who is signed in

```ts
import { useAuth } from '@core/contexts/AuthContext'
const { user, isLoading } = useAuth()
```

`user` is `null` or a `User` (`@core/types/auth`):

| Field | Notes |
|---|---|
| `id`, `email`, `full_name` | Person record identity |
| `account_id` | Currently active account (drives `X-Account-Id`) |
| `account?` | The Account row |
| `roles: string[]` | Role slugs — check `includes('system_admin')` etc. |
| `permissions: string[]` | Resolved permission strings |
| `is_system_admin?: boolean` | Shortcut for the system-admin role |
| `status?: string` | `'pending'` users are gated to the pending-approval page |
| `accessible_accounts?: Account[]` | Accounts the user may switch between |

## 5. `@core/lib/utils` — `cn` + formatters

```ts
import { cn, formatDateTime, formatCurrency } from '@core/lib/utils'
```

`cn(...)` = `twMerge(clsx(...))` for conditional Tailwind classes.
Formatters: `formatDate`, `formatTime`, `formatDateTime`,
`formatRelativeTime`, `formatFileSize`, `formatCurrency`, `formatNumber`,
`truncateText`. Use them instead of hand-rolling `toLocaleString` calls so
dates/money render consistently with the rest of the shell.

## 6. `@core/components/shared` — instant account/entity UI

| Component | Purpose |
|---|---|
| `MemberList` | Account members with roles |
| `InviteManager` | Invite creation/management UI |
| `AgentView` | AI-agent interaction surface |
| `FieldRenderer` | Render a `design_schema` field for display/input |
| `SchemaFields` | Render a whole `design_schema.fields` section |

`FieldRenderer`/`SchemaFields` are how generic pages render schema-driven
forms — reuse them in custom apps instead of reimplementing field widgets.

## 7. `@core/hooks/useApi` — request state wrappers

Thin React state over `apiFetch`-style calls. All three return
`{ data, loading, error, ... }` shapes with cancellation and callbacks.

| Hook | Signature | Use |
|---|---|---|
| `useApi<T>` | `(apiFn: (params?) => Promise<T>, { immediate?, onSuccess?, onError?, initialData? })` → `{ data, loading, error, execute, reset, refetch }` | One-shot fetch with cancellation |
| `usePaginatedApi<T>` | `(apiFn: ({page, itemsPerPage, ...}) => Promise<{data, pagination}>, { itemsPerPage? })` → adds `pagination`, `nextPage`/`prevPage` | Server-paginated lists |
| `useMutation<T, P>` | `(mutateFn: (params: P) => Promise<T>, { onSuccess?, onError?, onSettled? })` → `{ data, loading, error, mutate, reset }` | Create/update/delete calls |

## 8. `@core/components/kb` — knowledge-base widgets

`KBArticleList`, `KBArticleEditor` — list and editing UI for `kb` records.
Use when an app surfaces framework knowledge rather than its own KB types.

## 9. Layout, app context, client, types

| Import | Exports | Use |
|---|---|---|
| `@core/components/layout` | `AppShell`, `Header`, `Sidebar`, `Layout` | Wrap custom pages in the app chrome |
| `@core/contexts/AppContext` | `useCurrentApp() → AppRecord`, `useAppsRegistry() → { apps, routableApps, loading, error, refetch }`, `AppProvider`, `AppsRegistryProvider` | Current app's manifest row (slug, route_prefix, config, nav_items); the whole registry |
| `@core/lib/supabase` | `supabase` (browser client), `getCurrentSession`, `getCurrentUser`, `refreshSession` | Direct Supabase access — prefer `apiFetch`/endpoints for record data |
| `@core/types` | `DesignSchema`, `FieldDefinition`, `View`/`ListView`/`DetailView`, `ItemType`, `Item`, `PaginationParams`, `SortParams`, `FilterParams`, `FormState` | Shared type defs for schema-driven work |

## Other exports — available, unproven

`useEntityList`, `useEntityRecord`, `useSchemaRecord`, `useListSchema`,
`useForm`, `useBranding`, `useApps` exist in `hooks/`/`lib/` but shipped
apps do not use them today (they predate or duplicate the surfaces above).
Treat as internal scaffolding; prefer the documented tiers.

## Boundaries

- **Never import `@core/pages/*` or `@core/apps/*`** from a custom app —
  admin/internal pages are not SDK surface (one app importing
  `pages/admin/LogsPage` is a known violation, not a pattern).
- **Never import `@shared/*` in frontend code** — server-only modules.
- Framework code never imports from `custom/`; do not rely on your app
  being reachable from core.
- For runtime record CRUD, always `/api/admin-data` via `apiFetch` — never
  bespoke server endpoints (see [admin-data](api/admin-data.md)).

## Related

- [Build a custom page](../tasks/build-a-custom-page.md) — the task doc
  that uses this surface end to end
- [Apps and renderers](../concepts/apps-and-renderers.md) — mounting model
  and `useAppPath`'s role in it
- [admin-data API](api/admin-data.md) · [errors and envelopes](api/errors-and-envelopes.md)
