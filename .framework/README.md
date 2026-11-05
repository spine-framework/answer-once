# `.framework/` — Spine Framework core (managed copy)

This directory is the framework core of a Spine project: the React + Vite
frontend, the Netlify Functions API layer, the CLI, the database migrations and
seeds, and the instruction book your coding agent reads.

**It is a managed copy shipped by the
[`spine-framework`](https://www.npmjs.com/package/spine-framework) npm
package — do not edit it.** The `.spine-manifest.json` integrity manifest at
the project root hashes every file here; `npm run verify` (and the build)
fails on local modifications. Project code lives in `custom/`, which the
framework assembles into `src/` at dev/build time.

## Layout

| Path | Contents |
|---|---|
| `src/` | Frontend application source (assembled with `custom/` at build time) |
| `functions/` | Netlify Functions API layer (`_shared/` is the shared function SDK) |
| `cli/` | The `spine-framework` command-line tool (`npx spine-framework <cmd>`) |
| `migrations/` | Framework SQL migrations (`npx spine-framework migrate`) |
| `seeds/` | System seed data applied at install/migrate time |
| `schemas/` | Shared schemas (design-schema, manifests) |
| `templates/` | `init` templates — project files and `spine-*` agent skills |
| `scripts/` | Framework tooling scripts |
| `tests/` | Framework unit tests (`npm run test:unit`) |
| `docs/` | Framework-internal documentation |
| `public/` | Static assets served by the frontend |

## Documentation

The complete instruction book lives at
[`src/instructions/README.md`](src/instructions/README.md): install and
first-run guides, concepts (tenancy, permissions, design schema, automation),
single-goal task procedures, and CLI/API/env-var references. The same files
render inside the admin UI via each page's **Instructions** button.

## Upgrading

`.framework/` is replaced wholesale by `npx spine-framework upgrade` (after
`npm i spine-framework@latest`). Run `npx spine-framework migrate` afterwards
to apply any new framework migrations.

## License

Part of Spine Framework — see `LICENSE.md` at the project root
(Spine Framework / Answer Once Internal Use License).
