---
title: "CIL markers and generated doc tags"
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-29
source_files:
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/scripts/cil-migrate-markers.ts
  - AGENTS.md
---

# CIL markers and generated doc tags

Files throughout `.framework/` — `src`, `functions`, `cli`, `migrations` —
carry dense comment blocks that look like this:

```ts
// CIL[BEGIN stable_id="~/.framework/functions/_shared/pipeline-runner.ts:isuuid:function" type="function" identity="isUuid" parent="~/.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-MACRO purpose="isUuid function"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
function isUuid(v: string | undefined | null): v is string { ... }
// CIL[END stable_id="~/.framework/functions/_shared/pipeline-runner.ts:isuuid:function"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
```

and generated JSDoc like this:

```ts
/**
 * Validates whether a given string is a properly formatted UUID.
 * @inputSpec   - v: string — the value to be checked
 * @outputSpec  v is string — true if the value is a valid UUID
 * @sideEffects none
 * @stability   stable
 * @calls       UUID_RE.test
 * @cil-generated
 */
```

## What they are

**CIL** (Code Intelligence Layer) is the repository's internal
code-indexing tooling — it chunks the codebase into addressable units,
attaches generated documentation, and keeps embeddings in sync for semantic
search inside the monorepo. The comments are its on-disk metadata:

- `// CIL[BEGIN ...]` / `// CIL[END ...]` — delimit one tracked code chunk.
  `stable_id` is the chunk's durable identity
  (`<file>:<slug>:<kind>`); `type`, `identity`, and `parent` describe it.
- `// CIL[DOC-* …]` — generated or curated facts about the chunk:
  `DOC-MACRO` (purpose), `DOC-RESPONSIBILITY`, `DOC-CONTEXT`
  (module/layer/related files), `DOC-CONTRACT` (inputs/outputs/errors/
  side_effects), `DOC-MICRO` (logic summary, notable decisions),
  `DOC-CONFIDENCE` (pass + score), `DOC-STABILITY`, `DOC-AUDIENCE`,
  `DOC-PARAM`, `DOC-NOTE`, and `DOC-LEARNING`.
- `// CIL[DOC-VECTOR type="…" content="…" status="…"]` — the payload that
  becomes a search embedding (types include `context`, `blast_radius`,
  `constraint`, `configuration`, `implementation_pattern`, `user_journey`).
  `status="ready"` means it was generated; **`status="pending_human_input"`
  means the field is intentionally blank until an author fills it** — it is
  not an error and not a warning about the code itself.
- JSDoc tags `@macro`, `@micro`, `@inputSpec`, `@outputSpec`, `@sideEffects`,
  `@calls`, `@seeAlso`, `@errorHandling`, `@stability`, `@module`, `@layer`,
  `@audience`, `@cil-generated` mirror the same metadata in human-readable
  form; `@cil-generated` marks text written by the pipeline rather than a
  person.

## What they mean for you

- **Safe to ignore.** They are comments; they have no runtime effect, no API
  surface, and no effect on how you build apps on Spine. CIL is maintainer
  tooling, not a framework feature.
- **Read them as hints, not truth.** `DOC-*` summaries and JSDoc are
  generated interpretation — usually accurate, occasionally stale. The code
  is the authority; treat the tags like any other doc comment.
- **In framework files, leave them in place.** Editing or deleting markers by
  hand is harmless locally but gets rebuilt/renumbered the next time the
  repo's marker tooling runs (see `cil:migrate-markers` /
  `.framework/scripts/cil-migrate-markers.ts`). In your own `custom/` code
  you're free to add or omit them — nothing requires them.
- The contributor-facing conventions live in the repo's `AGENTS.md`; this
  page is only the legend for readers who meet the markers in shipped source.
