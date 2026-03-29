# SpendWise — frontend agent guide

The UI is **Next.js** (App Router), **React**, **TypeScript**, and **Tailwind CSS** under `app/` and `components/`. Match existing patterns before introducing new abstractions.

## Documentation to read first

- **Repo workflow & commands** (from repository root): [`docs/workflow.md`](../docs/workflow.md) — how `.cursorrules`, area guides, and [`docs/commands/`](../docs/commands/) playbooks fit together.
- **Run & deploy context**: [`README.md`](../README.md) — Docker Compose, app URLs, env files, ports.
- **Next.js (this repo’s version)**: read the guides shipped with your install under `node_modules/next/dist/docs/` when changing routing, `next.config`, or App Router APIs — they match the exact version in [`package.json`](./package.json). Public [nextjs.org](https://nextjs.org/docs) docs are a supplement; prefer in-tree docs when they differ.

## Product context

**SpendWise** is expense-management software. Treat amounts, dates, and account summaries as sensitive in UI copy and client logs. Prefer clear labels, consistent currency formatting, and accessible forms (labels, focus, errors).

---

<!-- BEGIN:nextjs-agent-rules -->
This Next.js version may differ from generic training data (APIs, conventions, file layout). Before writing or refactoring Next.js code, consult `node_modules/next/dist/docs/` for this project’s version and heed deprecation notices. For process and deliverables, use [`docs/workflow.md`](../docs/workflow.md) and [`docs/commands/`](../docs/commands/) when the task matches a playbook.
<!-- END:nextjs-agent-rules -->
