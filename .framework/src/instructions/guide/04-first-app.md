---
title: Build your first app
audience: developers, agents
kind: guide
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/functions/types.ts
  - .framework/functions/apps.ts
  - .framework/functions/admin-data.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/functions/_shared/schema-utils.ts
  - .framework/src/components/app-shell/GenericAppShell.tsx
  - .framework/src/components/app-shell/GenericListPage.tsx
  - .framework/src/components/app-shell/GenericDetailPage.tsx
  - .framework/src/components/CustomAppLoader.tsx
  - .framework/src/contexts/AppContext.tsx
  - .framework/src/lib/api.ts
  - .framework/cli/commands/create-app.ts
  - .framework/cli/commands/generate.ts
  - .framework/cli/commands/install-app.ts
---

# Build your first app

The smallest useful Spine app is one type + one app row — no code at all.
This walkthrough builds a `task` tracker end to end, then adds a custom page
and a pipeline. You need a `system_admin` login (see
[01-install-and-first-run.md](./01-install-and-first-run.md)) — app creation
is restricted to system admins (`.framework/functions/apps.ts`).

## Step 1 — define the type

Admin UI → **Configs → Types → New** (or `POST /api/types`). Set:

- **Kind**: `item` — records land in `public.items`.
- **Slug**: `task` — unique within `kind`; callers resolve types by it.
- **Design schema** — the fields, views, and permissions below.

```json
{
  "scope": "account",
  "fields": {
    "title":    { "data_type": "text",   "label": "Title",    "required": true,  "system": true },
    "status":   { "data_type": "select", "label": "Status",   "required": true,
                  "options": ["todo", "doing", "done"] },
    "priority": { "data_type": "select", "label": "Priority", "required": false,
                  "options": ["low", "normal", "high"] },
    "notes":    { "data_type": "textarea", "label": "Notes",  "required": false }
  },
  "views": {
    "default_list": {
      "type": "list", "display": "table", "label": "Tasks",
      "fields": {
        "title":      { "sortable": true, "display_type": "text" },
        "status":     { "sortable": true, "display_type": "badge" },
        "priority":   { "sortable": true, "display_type": "badge" },
        "created_at": { "sortable": true, "display_type": "timestamp" }
      },
      "default_sort": { "field": "created_at", "direction": "desc" }
    },
    "default_detail": {
      "type": "detail", "label": "Task",
      "sections": [
        { "title": "Core",
          "fields": {
            "title":    { "display_type": "input" },
            "status":   { "display_type": "select" },
            "priority": { "display_type": "select" },
            "notes":    { "display_type": "textarea" }
          } }
      ]
    }
  },
  "record_permissions": {
    "system_admin": ["create", "read", "update", "delete"],
    "engineering":  ["create", "read", "update"]
  },
  "functionality": null
}
```

On save, `validation_schema` is regenerated from `design_schema` by the types
API (`.framework/functions/types.ts`,
`.framework/functions/_shared/schema-utils.ts`) — you never write it yourself.
The rules that matter here: `select` fields need `options`; `title` is
`system: true` so it maps to the `items.title` column while `status`,
`priority`, and `notes` live in `items.data`; `record_permissions` is the base
grant evaluated on every `/api/admin-data` call, and its keys are matched
**verbatim** against `roles.slug` — so use real seeded slugs (`system_admin`,
`engineering`, `support`, …); a nonexistent or misspelled slug silently grants
nothing (`.framework/functions/_shared/permissions.ts`).

## Step 2 — register the app

Admin UI → **Configs → Apps → New** (or `POST /api/apps`):

```json
{
  "slug": "taskboard",
  "name": "Taskboard",
  "route_prefix": "/taskboard",
  "renderer": "generic",
  "min_role": "engineering",
  "is_active": true,
  "nav_items": [
    { "id": "tasks", "label": "Tasks", "path": "tasks", "type_slug": "task" }
  ]
}
```

`route_prefix` mounts the app at `/taskboard`; `renderer: "generic"` tells the
router to use `GenericAppShell`; each `nav_items` entry with a `type_slug`
gets list, `new`, and `:id` routes rendered from the type's views
(`.framework/src/components/app-shell/GenericAppShell.tsx`,
`GenericListPage.tsx`, `GenericDetailPage.tsx`). An app is routable when it
has a `route_prefix` and a renderer other than `none`
(`.framework/src/contexts/AppContext.tsx`).

Sign out/in (or wait for the apps registry refetch) and `/taskboard` renders
the Tasks list — create, edit, sort, and detail all work with zero code.

## Step 3 — add custom UI

When the generic views are not enough, switch `renderer` to `custom` and put
your code where the loader looks for it:

```bash
npx spine-framework create-app taskboard --role engineering
```

This scaffolds `custom/apps/taskboard/` with `manifest.json`, `index.tsx`
(a React Router stub), and `components/`, and registers the `apps` row with
`renderer: 'custom'` (`.framework/cli/commands/create-app.ts` — if the row
already exists it skips the insert). `CustomAppLoader` lazy-loads
`custom/apps/taskboard/index.tsx` via `import.meta.glob`
(`.framework/src/components/CustomAppLoader.tsx`), so edit the component, then:

```bash
npm run dev:netlify   # assemble runs automatically; or: npm run assemble && netlify dev
```

Your app is a normal React app under the `/taskboard/*` route, inside
`AppWrapper`. Custom functions go in `custom/functions/` (prefix filenames
`custom_` — assembly hard-fails on basename collisions with framework
functions; see [02-project-map.md](./02-project-map.md)).

## Step 4 — CRUD via `/api/admin-data`

Custom pages use the same endpoint as the generic renderer — never write a
bespoke CRUD function:

```ts
import { apiFetch } from '@core/lib/api'   // assembled alias → .framework/src

// list
await apiFetch('/api/admin-data?action=list&entity=items&type_slug=task&limit=50')

// create — type_slug resolves the type; non-system fields go in `data`
await apiFetch('/api/admin-data?action=create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    entity: 'items',
    type_slug: 'task',
    title: 'Ship the docs',
    data: { status: 'todo', priority: 'high' }
  })
})

// update — entity + id are query params; the body is the field patch
await apiFetch('/api/admin-data?action=update&entity=items&id=<uuid>', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: { status: 'doing' } })
})

// remove — soft-deletes (is_active = false) unless soft=false is passed
await apiFetch(`/api/admin-data?action=remove&entity=items&id=<uuid>`, { method: 'DELETE' })
```

`apiFetch` (`.framework/src/lib/api.ts`) attaches the Supabase Bearer token and
the `X-Account-Id` header; `admin-data` resolves `task` → its `type_id`,
stamps `design_schema`/`validation_schema` onto the new record, evaluates
`record_permissions` for the caller's role, writes, and fires
`item_created` triggers (`.framework/functions/admin-data.ts`).

## Step 5 — wire a pipeline

1. Admin UI → **Configs → Pipelines → New**: name it, `trigger_type` =
   `event`, `stages` = e.g. a `send_notification` stage
   (`.framework/functions/_shared/pipeline-runner.ts` has the built-in
   `stage_type` list).
2. Admin UI → **Configs → Triggers → New**: `event_type` = `item_created`,
   `pipeline_id` = the pipeline from step 1, `config.type_slug` = `task` to
   scope it (`.framework/functions/_shared/trigger-engine.ts`).
3. Ensure `INTERNAL_INVOKE_SECRET` is set — trigger dispatch POSTs to the
   `pipeline-runner-background` function and silently no-ops without it.
4. Create a task → the trigger queues a `pipeline_executions` row and the
   background runner executes the stages; watch it under
   **Observability → Executions**.

## Gaps

- **`npx spine-framework generate` was removed.** The old scaffold wrote
  stubs to a `v2-custom/` tree with `../v2-core/...` imports and a legacy
  `design_schema` shape (`type`/`layout` instead of `data_type`/`views`). It
  now prints migration guidance and exits 1
  (`.framework/cli/commands/generate.ts`). Author types in the admin UI or via
  `/api/types` instead.
- **`create-app` defaults `--role member`.** `member` and `member_admin`
  are seeded by `.framework/migrations/073_seed_member_roles.sql` (003
  seeds `system_admin`, `engineering`, `engineering_admin`, `product`,
  `docs`, `qa`, `devops`, `management`, `sales`, `csm`, `tam`, `support`,
  `support_admin`), so the default is valid on current installs. On a
  database that predates 073, pass `--role` a slug that exists in your
  `roles` table or create the role first.
- **`create-app` scaffold is minimal** — a `Routes` stub only. There is no
  generated CRUD page, `admin-data` hook, or seed block in the manifest it
  writes; the pattern in Step 4 is the integration contract.
- **Generic renderer is list/detail only.** `GenericAppShell` generates routes
  solely for nav items carrying `type_slug`; a nav item without one renders a
  sidebar button that navigates nowhere routable. Dashboards, wizards, or
  bespoke layouts require `renderer: 'custom'`.
- **No packaged example app ships in the npm package** — `custom/` is created
  empty by `init`, so there is no reference implementation to copy inside an
  installed project.
