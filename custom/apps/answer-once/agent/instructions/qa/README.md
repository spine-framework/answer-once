---
title: "Answer Once — Q&A corpus"
audience: developers, agents
kind: index
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - custom/apps/answer-once/manifest.json
  - custom/apps/answer-once/docs/install.md
  - custom/apps/answer-once/functions/custom_answeronce-journey.ts
---

# Q&A corpus

Canonical question→answer pairs for Answer Once — the questions a developer
installing the app (or that installer's customers) will ask, each with the
reference answer. One file per question so each maps 1:1 onto a ticket and,
later, a published `ao_kb_article`.

## Using this corpus

- **As product knowledge** — agents in an AO install should answer from these
  files directly; each carries `suggested_kb_tag` and grounding `source_files`
  in frontmatter.
- **As a dogfood bootstrap** — AO installs with an empty KB by design
  (knowledge is earned, never seeded). To grow a real KB: post the question as
  a customer ticket → triage misses → answer with the **A** text → resolve →
  case analysis → KB review → publish with the suggested tag. Repeat. Re-ask
  earlier questions with different wording to verify triage answers from
  published articles instead of routing to a human.

## Customer-facing questions

- [`what-is-answer-once.md`](what-is-answer-once.md) — What is Answer Once?
- [`how-do-i-submit-a-support-ticket.md`](how-do-i-submit-a-support-ticket.md) — How do I submit a support ticket?
- [`what-happens-after-i-submit-a-ticket.md`](what-happens-after-i-submit-a-ticket.md) — What happens after I submit a ticket?
- [`what-do-the-ticket-statuses-mean.md`](what-do-the-ticket-statuses-mean.md) — What do the ticket statuses mean?
- [`the-ai-answered-my-ticket-but-it-didnt-help-what-now.md`](the-ai-answered-my-ticket-but-it-didnt-help-what-now.md) — The AI answered my ticket but it didn't help — what now?
- [`what-is-pending-resolution-and-why-did-my-ticket-resolve-its.md`](what-is-pending-resolution-and-why-did-my-ticket-resolve-its.md) — What is "pending resolution" and why did my ticket resolve itself?
- [`where-can-i-see-all-my-tickets.md`](where-can-i-see-all-my-tickets.md) — Where can I see all my tickets?
- [`how-do-i-reply-to-a-ticket.md`](how-do-i-reply-to-a-ticket.md) — How do I reply to a ticket?
- [`will-i-get-an-email-when-support-replies.md`](will-i-get-an-email-when-support-replies.md) — Will I get an email when support replies?
- [`can-i-follow-a-ticket-someone-else-on-my-team-opened.md`](can-i-follow-a-ticket-someone-else-on-my-team-opened.md) — Can I follow a ticket someone else on my team opened?
- [`what-is-the-knowledgebase-page.md`](what-is-the-knowledgebase-page.md) — What is the Knowledgebase page?
- [`why-can-i-see-some-knowledge-base-articles-but-not-others.md`](why-can-i-see-some-knowledge-base-articles-but-not-others.md) — Why can I see some knowledge base articles but not others?
- [`who-can-see-my-tickets.md`](who-can-see-my-tickets.md) — Who can see my tickets?
- [`how-do-i-add-teammates-to-our-account.md`](how-do-i-add-teammates-to-our-account.md) — How do I add teammates to our account?
- [`whats-the-difference-between-a-member-and-a-member-admin.md`](whats-the-difference-between-a-member-and-a-member-admin.md) — What's the difference between a member and a member_admin?
- [`can-i-reopen-a-resolved-ticket.md`](can-i-reopen-a-resolved-ticket.md) — Can I reopen a resolved ticket?
- [`what-should-i-include-in-a-good-support-ticket.md`](what-should-i-include-in-a-good-support-ticket.md) — What should I include in a good support ticket?
- [`why-did-i-get-an-answer-instantly-instead-of-waiting-for-sup.md`](why-did-i-get-an-answer-instantly-instead-of-waiting-for-sup.md) — Why did I get an answer instantly instead of waiting for support?
- [`does-answer-once-learn-from-my-tickets.md`](does-answer-once-learn-from-my-tickets.md) — Does Answer Once learn from my tickets?
- [`can-i-browse-the-knowledge-base-without-opening-a-ticket.md`](can-i-browse-the-knowledge-base-without-opening-a-ticket.md) — Can I browse the knowledge base without opening a ticket?
- [`how-does-an-answer-get-into-the-knowledge-base.md`](how-does-an-answer-get-into-the-knowledge-base.md) — How does an answer get into the knowledge base?
- [`can-customers-write-knowledge-base-articles-directly.md`](can-customers-write-knowledge-base-articles-directly.md) — Can customers write knowledge base articles directly?
- [`how-fast-should-i-expect-an-answer.md`](how-fast-should-i-expect-an-answer.md) — How fast should I expect an answer?
- [`is-there-a-limit-to-how-many-tickets-i-can-open.md`](is-there-a-limit-to-how-many-tickets-i-can-open.md) — Is there a limit to how many tickets I can open?
- [`can-i-open-one-ticket-for-several-unrelated-questions.md`](can-i-open-one-ticket-for-several-unrelated-questions.md) — Can I open one ticket for several unrelated questions?

## Operator & install questions

- [`how-do-i-install-answer-once.md`](how-do-i-install-answer-once.md) — How do I install Answer Once?
- [`does-answer-once-come-with-a-pre-loaded-knowledge-base.md`](does-answer-once-come-with-a-pre-loaded-knowledge-base.md) — Does Answer Once come with a pre-loaded knowledge base?
- [`what-environment-variables-does-answer-once-need.md`](what-environment-variables-does-answer-once-need.md) — What environment variables does Answer Once need?
- [`how-does-the-ai-triage-actually-decide-to-answer-vs-escalate.md`](how-does-the-ai-triage-actually-decide-to-answer-vs-escalate.md) — How does the AI triage actually decide to answer vs. escalate?
- [`what-are-the-three-publish-flavors-for-a-kb-article.md`](what-are-the-three-publish-flavors-for-a-kb-article.md) — What are the three publish "flavors" for a KB article?
- [`what-does-the-auto-resolve-cron-do.md`](what-does-the-auto-resolve-cron-do.md) — What does the auto-resolve cron do?
- [`how-do-i-set-up-support-staff.md`](how-do-i-set-up-support-staff.md) — How do I set up support staff?
- [`how-do-notifications-and-email-work.md`](how-do-notifications-and-email-work.md) — How do notifications and email work?
- [`what-is-a-candidate-article-and-the-kb-review-page.md`](what-is-a-candidate-article-and-the-kb-review-page.md) — What is a "candidate" article and the KB review page?
- [`how-do-embeddings-stay-fresh-when-articles-change.md`](how-do-embeddings-stay-fresh-when-articles-change.md) — How do embeddings stay fresh when articles change?
- [`how-do-tickets-threads-and-messages-relate.md`](how-do-tickets-threads-and-messages-relate.md) — How do tickets, threads, and messages relate?
- [`how-do-i-upgrade-the-framework-vs-the-app.md`](how-do-i-upgrade-the-framework-vs-the-app.md) — How do I upgrade the framework vs. the app?
- [`what-does-verify-install-check.md`](what-does-verify-install-check.md) — What does `verify:install` check?
- [`what-record-types-does-answer-once-define.md`](what-record-types-does-answer-once-define.md) — What record types does Answer Once define?
- [`what-are-the-seeded-agents-pipelines-and-triggers.md`](what-are-the-seeded-agents-pipelines-and-triggers.md) — What are the seeded agents, pipelines, and triggers?
- [`does-answer-once-require-cil-or-any-extra-services.md`](does-answer-once-require-cil-or-any-extra-services.md) — Does Answer Once require CIL or any extra services?
- [`can-i-customize-the-ao-pages-or-add-my-own.md`](can-i-customize-the-ao-pages-or-add-my-own.md) — Can I customize the AO pages or add my own?
