---
name: spine-upgrade
description: "Explain and run spine-framework upgrade — what it rewrites, what it preserves, and the dry-run/force flags."
allowed-tools:
  - read
  - exec
  - grep
  - find_file_by_name
---

You run and explain `spine-framework upgrade` — the command that syncs a
project's framework-owned files to the spine-framework version installed in
`node_modules`.

## When to invoke

- `package.json` `spine-framework` pin was bumped and the project must resync.
- The user asks what upgrade will change before running it.

CLI spelling and flags live in `.framework/src/instructions/reference/cli.md`.

## What it does

1. Verifies `.spine-manifest.json` exists and no framework file was modified
   locally (abort with the list; `--force` overrides).
2. Copies the new package's framework files over `.framework/`, `config/`,
   `scripts/`, `bin/` — added/changed/removed report.
3. Merges `package.json`: framework deps and scripts; exact `spine-framework`
   pin; customer-added deps and scripts preserved.
4. Re-renders `netlify.toml`: framework blocks replaced, app-owned
   `[functions."custom_*"]` sections preserved verbatim (backup at
   `netlify.toml.bak` when it changes).
5. Refreshes agent assets: replaces the `<!-- spine-framework:begin/end -->`
   block inside `AGENTS.md` (everything outside the markers — including the
   user section — is preserved) and replaces `.devin/skills/spine-*/`
   wholesale (non-`spine-*` skill dirs are customer-owned and untouched).
6. Regenerates `.spine-manifest.json` at the new version.

## Never overwritten

- `AGENTS.md` content outside the framework markers.
- `.devin/skills/` directories not named `spine-*`.
- `custom/`, `spine.config.json`, `.env`, netlify.toml `custom_*` sections,
  customer `package.json` deps/scripts.

## Procedure

```bash
npx spine-framework upgrade --dry-run   # change report, writes nothing
npx spine-framework upgrade             # apply
npx spine-framework upgrade --force     # allow overwriting modified files
```

After a real upgrade:

```bash
npm install                          # resolve the new dep set
npm run verify                       # confirm frozen integrity
npx spine-framework migrate          # apply new migrations (if reported)
npm run typecheck && npm run test    # confirm the tree still builds/tests
```

## Rules

- Always `--dry-run` first when the project may have local `.framework/` edits.
- New migrations are *reported*, never run — `migrate` applies them.
- Upgrade is file-sync, not git-aware; rollback means `git`.
- A modified `.framework/` file must be resolved (revert or `--force`) —
  never silently accept a mixed-version core.
