---
name: spine-docs-sync
description: "Re-verify the docs your change touches — find pages and skills citing the files you edited, re-check their claims against current code, and bump verified_against only for pages actually checked."
verified_against: 15faf83
verified_on: 2026-11-23
allowed-tools:
  - exec
  - read
  - grep
  - edit
depends_on:
  files:
    - custom/apps/
    - custom/.devin/skills/
    - .framework/src/instructions/internal/docs-contract.md
  commands:
    - "npx spine-framework doctor"
    - "npx spine-framework validate-app"
---

# spine-docs-sync — a code change is incomplete until its docs are re-synced

The Spine rule: docs are part of the change, not a follow-up chore. In an
installed project the framework book (`.framework/src/instructions/`) is
sealed — upgrade-owned, never edited. The docs *you* keep true are your
app's book (`custom/apps/<slug>/src/instructions/` + `docs/`), project
docs, `custom/decisions/`, and shipped skills (`custom/.devin/skills/`).

## Procedure

1. **Find what cites your change.** Search the docs you own for the files
   you edited:

   ```bash
   grep -rl '<changed-file-path>' custom/apps/*/src/instructions/ \
     custom/apps/*/docs/ custom/.devin/skills/ custom/decisions/ docs/ 2>/dev/null
   ```

   Also check `source_files:` / `depends_on:` frontmatter lists — any doc
   naming a file you touched needs re-verification.

2. **Re-verify each affected page or skill.** Re-read the cited code at the
   current state and check the claims the page makes. Skills: mentally
   re-run the procedure — commands, paths, and file references must still
   resolve.

3. **Correct, don't caveat.** Wrong claims are fixed in the same change.
   Process or *why* claims that look wrong are flagged for their human
   owner, not silently rewritten.

4. **Bump anchors only for checked pages.** Move `verified_against`
   (commit or version) and `verified_on` forward only where you actually
   re-checked the claims. Never bump to quiet a check.

5. **Capture what you learned.** Non-obvious constraints, traps, rejected
   approaches → the page's `## Agent notes`, or a decision record via
   `spine-decision-capture`, or a test — in that order.

6. **Verify.** `npx spine-framework doctor` for wiring health;
   `npx spine-framework validate-app custom/apps/<slug>` when the change
   touched an app package (it also catches `agent/` ↔ `src/` drift).

## Rules

- New or changed app page/route → the app's tasks doc and README route map.
- New or changed function → the app's `reference/functions` page.
- New or changed seeded type → the app's entity page for that type.
- A doc nobody can verify and nobody owns gets a `describes:` anchor or is
  removed — stale docs mislead every future agent that opens them.
