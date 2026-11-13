---
id: answer-once:0002-packaged-artifact-install-contract
title: The published tarball is the install contract — package contents must satisfy the declared peer range
status: accepted
kind: invariant
owner: package
since: 0.2.11
until: null
supersedes: null
superseded_by: null
links: []
applies_to:
  - custom/apps/answer-once/package.json
  - custom/apps/answer-once/manifest.json
  - custom/apps/answer-once/standalone.config.json
  - scripts/db-fixtures.ts
enforced_by:
  - scripts/db-fixtures.ts
evidence:
  - { kind: fixture, ref: "db:fixtures F2-pkg/F2b-pkg — published tarballs reproduce the defect", label: fixture }
  - { kind: fixture, ref: "db:fixtures P-cand — HEAD AO tarball installs+seeds on published spine-framework 0.5.5", label: fixture }
provenance: captured
---

## Context

Published `@spine-framework/answer-once` packages from 0.2.6 through 0.2.10
could not be installed or seeded through the documented path. Production was
seeded via the manual `seed-answer-once.ts` bypass, so the defect was never
observed. Fixture evidence (`F2-pkg`, `F2b-pkg`, `P-cand`) revealed three
stacked packaging defects, none of which a source-tree check could see:

1. `manifest.json` version drifted from `package.json` on every release
   >=0.2.6 — `seed-app`/`install-app` fail at validation.
2. `decisions/` was added to `files` while the peer range
   (`>=0.4.0 <0.6.0`) includes framework releases whose
   `validateAllowedDirectories` rejects `decisions/` (fixed at 0.6.0/HEAD).
3. `standalone.config.json` `copy.custom_migrations` declared only prefixes
   `062`/`063`, so `installer/migrations/` shipped without 064–070 while the
   seed depended on them (`make_scenario` action from
   `066_answeronce_make_integration`).
4. The declared peer range `>=0.4.0 <0.6.0` was never verified: framework
   0.4.x validators reject `agent/` and `installer/` outright — a structural
   incompatibility no package-content change can fix (`P-cand-0.4.4`).

## Decision

- `manifest.json.version` must equal `package.json.version` at pack time.
- `files` may only contain directories accepted by every framework release in
  the declared `peerDependencies` range. `decisions/` is excluded from the
  package until the peer floor reaches a release whose validator allows it;
  it remains a first-class app directory in source.
- `copy.custom_migrations` must enumerate every `answeronce_*` migration
  prefix the app's seed/install depends on.
- The declared `peerDependencies` range must be fixture-verified against the
  actual published framework tarballs. `0.2.11` narrows it to
  `>=0.5.0 <0.6.0` — every release in the range installs and seeds the
  packed candidate (`P-cand`/`P-cand-0.5.*`); 0.4.x structurally cannot
  (`P-cand-0.4.4`).
- Correctness of the published artifact is verified by installing the actual
  packed tarball onto the published framework (`P-cand` fixture), not by
  source-tree checks.

## Consequences

Historical packages remain published and broken; their failures are recorded
as fixture evidence, not rewritten. Customers who installed AO <0.2.11 via the
monorepo or the manual seed bypass are unaffected.
