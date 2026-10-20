# Answer Once

> A person should not have to answer the same organizational question twice.

Focused customer-support and knowledge-loop app for **Spine Framework**.

Customer asks → do we know? → yes: answer instantly with citation → no: human solves →
answer becomes reviewed, published knowledge → the next customer gets the answer
automatically.

## Install

```bash
npm create @spine-framework/answer-once@latest my-support
cd my-support
cp .env.example .env     # fill in your Supabase project credentials
npm install
npm run verify
npm run spine-framework -- migrate
npm run spine-framework -- seed-app answer-once
npm run verify:install
npm run dev:netlify
```

This scaffolds a fresh project: the framework file set plus the Answer Once
app in `custom/apps/answer-once/`. See **[docs/install.md](docs/install.md)**
for the complete procedure including the Supabase project setup.

The install starts with an **empty knowledge base** — no seeded articles, no CIL
data. Knowledge is earned through real support work (escalate → resolve →
analyze → publish → reuse).

## Upgrading

```bash
# Framework (app-agnostic; owns .framework/, config/, scripts/, bin/)
npm i spine-framework@latest && npx spine-framework upgrade

# This app (owns custom/apps/answer-once/ and its custom/migrations/062_* files)
npm i @spine-framework/answer-once@latest && npx answer-once upgrade
```

Both upgrade commands refuse to overwrite files you modified locally; pass
`--dry-run` to preview or `--force` to overwrite.

## Status

`0.2.x` — the npm install/upgrade path is the primary distribution. The public
API surface is the app manifest and its runtime record types; internals may
change between minor versions.
