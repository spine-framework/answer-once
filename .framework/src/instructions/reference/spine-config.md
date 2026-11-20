---
title: spine.config.json Reference
audience: developers, agents
kind: reference
verified_against: a812c8e
verified_on: 2026-11-20
source_files:
  - .framework/schemas/spine.config.schema.json
  - .framework/templates/spine.config.neutral.json
  - .framework/src/lib/branding.ts
  - .framework/src/hooks/useBranding.ts
  - .framework/cli/commands/install-app.ts
---

# `spine.config.json` Reference

`spine.config.json` is the per-project instance config. It lives at the
project root and is served to the browser as a static public asset — the
frontend fetches `/spine.config.json`. **Everything in it is client-visible;
never put secrets here.** The JSON Schema is
`.framework/schemas/spine.config.schema.json`; the neutral starting point is
`.framework/templates/spine.config.neutral.json`.

```json
{
  "branding": {
    "app_name": "My Product",
    "title": "My Product",
    "logo_url": "/logo.svg",
    "favicon_url": "/favicon.svg"
  },
  "registration": {
    "default_app": "my-app",
    "default_role": "member",
    "allow_url_override": false,
    "default_app_by_role": { "support": "my-app" },
    "apps": {
      "my-app": {
        "roles": ["member", "member_admin"],
        "default_role": "member_admin",
        "path": "/my-app",
        "enabled": true,
        "account_strategy": "new",
        "parent_account": "spine-system"
      }
    }
  }
}
```

## `branding`

Read by `.framework/src/lib/branding.ts` (`loadBranding` fetches
`/spine.config.json` and caches it) and applied to framework-owned pages —
login, register, setup, sidebars — plus `document.title` and the favicon via
`useBranding` (`.framework/src/hooks/useBranding.ts`). All keys optional;
an absent block falls back to Spine defaults.

| Key | Default | Effect |
|---|---|---|
| `app_name` | `"Spine"` | display name in headings and logo alt text |
| `title` | `app_name` (or `"Spine Framework"`) | `document.title` and sidebar wordmark |
| `logo_url` | `"/spine-logo-lockup.svg"` | public asset path for the brand logo (lockup — the default asset carries the wordmark) |
| `favicon_url` | `"/spine-logo.svg"` | swapped into `link[rel=icon]` at runtime |

## `brands`

Multi-brand map, resolved by `resolveBranding(config.branding, config.brands, hostname)`:
`by_host` maps a request hostname to a brand slug, `definitions` holds
per-brand identity, `default` is the fallback slug. A host with no
`by_host` entry (and no `default`) uses flat `branding` as the base.

| Key | Type | Effect |
|---|---|---|
| `default` | string | fallback brand slug when no host match |
| `by_host` | `{hostname: brandSlug}` | host → brand resolution |
| `definitions.<slug>` | object | per-brand identity: `name`, `app_name`, `title`, `site_url`, `logo_url`, `favicon_url`, `email_logo_url`, `email_from` |

## `registration`

Consumed by the registration/login pages and kept in sync with
`apps.config.registration` by the installer (`syncAppRegistration` and
`updateRegistrationConfig` in `.framework/cli/commands/install-app.ts` — the
DB write lands first, then the file).

| Key | Type | Effect |
|---|---|---|
| `default_app` | string (app slug) | where registrants land when no role rule matches; auto-set to the first enabled app when absent |
| `default_role` | string (role slug) | role assigned when the app entry has no `default_role` |
| `allow_url_override` | boolean | allow a `?app=`/`?role=` URL override at registration; installer sets `true` when undefined |
| `default_app_by_role` | `{role: appSlug}` | per-role landing-app map |
| `apps` | `{appSlug: AppEntry}` | per-app registration policy, see below |

### `registration.apps.<slug>`

| Key | Type | Effect |
|---|---|---|
| `roles` | string[] | roles registrants may be placed into through this app |
| `default_role` | string | role assigned by default |
| `path` | string | redirect path after registration completes |
| `enabled` | boolean | `true` opens self-service registration for this app; explicit `false` persists a disabled policy |
| `account_strategy` | `"new" \| "existing"` | create a new account or join `target_account` |
| `parent_account` | string | account slug new accounts are parented under (e.g. `spine-system`) |
| `target_account` | string (uuid) | account to join under `existing` strategy |
| `default_workspace_name` | string | name for the workspace created at registration |
| `allow_domain_join` | boolean | allow signups whose email domain matches an existing account to join it |

## File vs. schema notes

- `additionalProperties: true` at the root — extra top-level keys are allowed
  and preserved.
- `loadSpineConfig` throws on malformed JSON, a non-object root, a non-object
  `registration`, or a non-object `registration.apps`; a missing file returns
  `{registration: {apps: {}}}`.
- The installer writes `registration.apps.<slug>` and `default_app`/`default_role`
  when an app manifest declares `registration.enabled: true` — see
  [App Manifest](app-manifest.md).
- `.framework/public/spine.config.json` is the framework's copy of the served
  asset; the project root file is what `init` scaffolds and the frontend
  actually fetches at runtime.

## Related files

- `.framework/schemas/spine.config.schema.json` — validation schema
- `.framework/templates/spine.config.neutral.json` — minimal valid config
- `.framework/src/lib/branding.ts` — branding resolution and defaults
- `.framework/cli/commands/install-app.ts` — `loadSpineConfig`, `saveSpineConfig`, `updateRegistrationConfig`
