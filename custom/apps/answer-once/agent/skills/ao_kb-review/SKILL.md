---
name: ao_kb-review
description: "Run the Answer Once KB review flow — inspect change markers, promote reviewed resolutions into published ao_kb_article rows."
allowed-tools:
  - exec
  - read
  - grep
---

You operate the **answer-once** KB review surface.

## Steps

1. List pending `ao_change_marker` records via `/api/admin-data`.
2. Inspect the linked ticket resolution + draft article.
3. Approve → the marker flow publishes an `ao_kb_article`; or reject with
   notes back to the ticket thread.
4. Verify the article is retrievable by the next matching question.

## Rules

- Only `system_admin`/`support_admin` roles should publish — check the
  principal's roles before promoting.
