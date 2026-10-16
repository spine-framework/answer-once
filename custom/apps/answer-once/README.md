# Answer Once

> A person should not have to answer the same organizational question twice.

Focused customer-support and knowledge-loop app for **Spine Framework**.

Customer asks → do we know? → yes: answer instantly with citation → no: human solves →
answer becomes reviewed, published knowledge → the next customer gets the answer
automatically.

## Install

For a standalone deployment (framework + Answer Once on a fresh Supabase project),
use the source export — see **[docs/install.md](docs/install.md)** for the complete
human-operated procedure:

```bash
cd <monorepo>
npx tsx scripts/export-standalone.ts --app answer-once --output <destination>
```

The standalone starts with an **empty knowledge base** — no seeded articles, no CIL
data. Knowledge is earned through real support work (escalate → resolve → analyze →
publish → reuse).

An npm-published package install (`install-app`) is planned but not yet verified —
do not rely on it for new installs.

## Status

`0.1.x` — early release. The public API surface is the app manifest and its runtime
record types; internals may change between minor versions.
