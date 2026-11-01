---
title: Framework Upgrades
audience: both
kind: reference
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/cli/commands/upgrade.ts
  - .framework/cli/lib/project-files.ts
  - scripts/checksum-manifest.mts
  - scripts/verify-integrity.sh
  - .framework/templates/project.json
  - netlify.toml
---

# Framework Upgrades

`npx spine-framework upgrade` syncs a project's framework-owned files to the
`spine-framework` version installed in `node_modules`
(`.framework/cli/commands/upgrade.ts`). It is a file sync with an integrity
gate, not a git operation — and the executing copy is always the **new**
package's code, since `npx` resolves `node_modules`.

## What is sealed

The frozen manifest `.spine-manifest.json` (written by `init`, regenerated
by `upgrade`) records a sha256 for every file under the protected trees —
`.framework/`, `config/`, `scripts/`, plus `bin/`
(`scripts/checksum-manifest.mts`, `PROTECTED_DIRS` + `--include-dir bin`).
The file set itself is declared by `.framework/templates/project.json`
(`framework_dirs`, `framework_files`, `config_files`, `root_scripts`,
`bin`).

Also recorded in the manifest: `framework_version`,
`framework_dependencies` (so the package.json merge knows which deps the
framework owns), a `tree_digest`, and a separate `agent_files` hash map
(more below). `npm run verify` re-hashes the tree and fails on drift;
`SPINE_INTEGRITY=warn` downgrades that to warnings.

## The integrity gate

Before writing anything, upgrade re-hashes every manifest entry:

- Any **modified or missing** protected file → abort with a per-file list.
  The only way through is `--force`, which overwrites modified files and
  restores missing ones (each is logged).
- This is the safety rail: overwriting `.framework/` loses nothing the user
  owned, because the gate proves they never changed it. **Never edit sealed
  trees** — the change is either blocked or silently reverted later.
- `--dry-run` computes the full report (added / changed / removed / agent
  assets / new migrations) and writes nothing.

## What an upgrade does, in order

1. Preconditions: refuses to run from the vendored copy (`package.json`
   `name` must be `spine-framework`), requires `.spine-manifest.json`,
   and refuses to downgrade (`cmpSemver` on `framework_version`).
2. Integrity gate (above).
3. Collects the new file set, then applies copies; **deletions are confined
   to `.framework/`** — files outside it that upstream dropped are warned
   about and left in place.
4. Syncs agent assets (below).
5. Merges `package.json`: framework scripts and the dependency set are
   rewritten, `spine-framework` pinned exactly; a dependency is removed
   **only** if the previous framework version owned it and the new one
   doesn't. Customer scripts/deps survive.
6. Re-renders `netlify.toml`: framework blocks come from the package;
   `[functions."custom_*"]` sections in the existing file (with their
   attached comments) are re-appended verbatim — that's where app-owned
   scheduled functions live. A changed render leaves `netlify.toml.bak`.
7. Regenerates `.spine-manifest.json` at the new version.
8. Lists new `.framework/migrations/*.sql` files — reported, **never run**.
   `npx spine-framework migrate` applies them.

## Agent files merge behavior

`profile.agent_files` (`.framework/templates/project.json`) declares two
merge modes, applied by `syncAgentFiles` in
`.framework/cli/lib/project-files.ts`:

- **`framework-block` → `AGENTS.md`.** The template renders
  `{{SPINE_VERSION}}`, then the marker-delimited block —
  `<!-- spine-framework:begin version=X.Y.Z -->` …
  `<!-- spine-framework:end -->` — is replaced in place. Everything outside
  the markers is customer content and is preserved. A file with no markers
  gets the block **prepended** (never overwritten). Hashes go into the
  manifest's `agent_files` map — deliberately not `files`, so edits outside
  the markers don't count as drift.
- **`dir-replace` → `.devin/skills`.** Only `spine-*` subdirectories are
  removed and re-copied from the package. Sibling dirs with any other name
  are customer-owned and untouched.

## What upgrade never touches

`custom/`, `spine.config.json`, `.env`, `.spine/`, `netlify.toml`
`[functions."custom_*"]` sections, and the customer-owned parts of
`AGENTS.md` / `.devin/skills`. If a run would destroy your work, the design
has failed — that is the promise the sealed layer exists to keep (see
[Core vs Custom Boundary](../concepts/core-vs-custom.md)).

## Upgrade checklist

- [ ] `npm run verify` clean *before* starting — a dirty tree only aborts later anyway.
- [ ] `npm install spine-framework@<version>` first; upgrade syncs to whatever `node_modules` has.
- [ ] `npx spine-framework upgrade --dry-run`, read the report, then run for real.
- [ ] Never pass `--force` to make local `.framework/` edits stick — it does the opposite. Move the change to `custom/` first.
- [ ] `npm install` after (dependency set changed), then `npm run verify`.
- [ ] `npx spine-framework migrate` for the reported new migrations ([Migrations](migrations.md)).
- [ ] Re-run `npm run assemble` / restart `netlify dev` so `.assembled/` picks up the new files ([Deployment](deployment.md)).
- [ ] Commit the result — manifest, `netlify.toml`, `package.json`, `.devin/skills`, `AGENTS.md` are all part of the upgrade diff.

## Related

- [Anatomy of an installed project](../guide/02-project-map.md) — sealed vs customer trees
- [Migrations](migrations.md) · [Deployment](deployment.md) · [Troubleshooting](troubleshooting.md)
- [CLI Reference](../reference/cli.md) — `upgrade`, `verify`, `doctor`
