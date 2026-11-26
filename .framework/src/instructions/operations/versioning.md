---
title: Versioning and compatibility
audience: developers, agents
kind: reference
verified_against: eb8a2fe
verified_on: 2026-11-26
source_files:
  - package.json
  - .framework/cli/commands/upgrade.ts
  - .framework/cli/commands/install-app.ts
  - .framework/cli/lib/project-files.ts
asserted_by:
  - "Owner direction, developer-lifecycle plan (2026-11-16): publish what minor vs patch means for consumers (migrations, shipped config, removed commands); decision spine-framework:0024-versioning-policy"
---

# Versioning and compatibility

What a `spine-framework` version number promises a consumer — and what it
doesn't.

## The channels

| npm dist-tag | Line | Who it's for |
|---|---|---|
| `latest` | stable (`0.x.y`) | production consumers |
| `rc` | prerelease (`0.x.y-rc.n`) | early adopters, pre-release validation |
| `next` | legacy 0.3 line | historical — do not install for new work |

Consumers get release notes on the GitHub mirror for every rc/final —
the authoritative "what changed and what you must do."

## What each bump may change

**Patch (`0.x.y → 0.x.y+1`)** — bug fixes and doc/skill corrections.

- May still ship a migration — patches can fix schema too; `upgrade`
  reports it, `migrate` applies it.
- Consumer action: `npm i spine-framework@latest` → `upgrade` →
  `verify` → `migrate` if reported. App packages' `^0.x` peer ranges
  float onto patches automatically — no app republish needed.
- No removed commands, no peer-floor changes, no contract breaks.

**Minor (`0.x → 0.x+1`)** — features, schema additions, shipped-file
changes.

- Expect new migrations; expect the shipped file set to change
  (`.framework/` grows/shrinks; agent skills refresh; the CI template
  updates).
- Peer floors may move: app packages' `peerDependencies` declare the
  framework range they work against — a minor that raises the floor
  means the app needs a republish too (release notes say so).
- Scaffolder packages (`create-spine-framework`, `create-*`) track the
  minor line — crossing one bumps their `spine-framework` dep to the new
  `^0.x`.

**Major** — not yet on the 0.x line; pre-1.0, minor is the largest unit.

## The compatibility contract — what stays stable

- **Applied migrations never change.** Your DB ledger is append-only;
  corrections ship as new migrations, never edits (exceptional
  corrections need a recorded decision — see decision `0011`).
- **Your tree is yours.** `custom/`, `spine.config.json`, `.env`, the
  `AGENTS.md` region below `spine-framework:end`, `.devin/skills/` dirs
  not named `spine-*`, and `.github/workflows/` files not named
  `spine-*` are never overwritten by `upgrade`.
- **Runtime API shape.** `/api/admin-data` and the entity APIs are
  additive — fields/actions get added, not removed, within a minor
  series.

## The deprecation path — how things go away

1. **Stub first.** A removed capability becomes a stub that prints
   migration guidance and exits non-zero — `generate` is the live
   example: it tells you `create-app`/`validate-schema` instead of
   failing silently. Stubs ship in a release, announced in notes.
2. **Remove later.** The stub is dropped in a subsequent release after
   the notes have carried the guidance.
3. **Never silent.** If a command/flag/behavior disappears, the release
   notes carry a Breaking Changes section — there is no
   quiet-removed-path.

## Version pins that must agree

- `package.json` version ↔ the app's `manifest.json` version —
  `validatePackageJson` enforces equality; a mismatch makes
  `install-app`/`seed-app` throw.
- An app package's `files` allowlist is validated by the **installed**
  framework's rules, not the newest — a dir allowed at HEAD but rejected
  by an older floor can't ship until the peer floor allows it.
- `package-lock.json` is the upgrade baseline — `update-app` verifies
  the installed version + integrity from it, not from `package.json`
  ranges.

## Related

- [Upgrade](upgrade.md) — the mechanics per project.
- [Upgrade many projects](../tasks/upgrade-many-projects.md) — the agency
  loop.
- [Migrations](migrations.md) — ledger semantics.
