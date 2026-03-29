# SpendWise — backend agent guide

The API is **NestJS** (TypeScript) under `backend/src/`. Prefer modules, controllers, and services that match existing layout; extend patterns already in the tree before introducing new ones.

## Documentation to read first

- **Repo workflow & commands** (from repository root): [`docs/workflow.md`](../docs/workflow.md) — how `.cursorrules`, area guides, and [`docs/commands/`](../docs/commands/) playbooks fit together.
- **Run & deploy context**: [`README.md`](../README.md) — Docker Compose, Postgres, env files under `docker-compose-env/`, ports.
- **NestJS**: [https://docs.nestjs.com](https://docs.nestjs.com) — framework APIs, guards, validation, and patterns. Prefer the installed package versions in `package.json` over older training examples.

## Product context

**SpendWise** is expense-management software. Treat money, user identity, and session data as sensitive; avoid logging secrets or full payloads in production code paths.

---

<!-- BEGIN:backend-agent-rules -->
Before adding routes, DTOs, or auth flows, confirm naming and structure against existing `*.module.ts` / `*.controller.ts` / `*.service.ts` files. If requirements are ambiguous, check [`docs/workflow.md`](../docs/workflow.md) and the relevant playbook under [`docs/commands/`](../docs/commands/) before implementing.
<!-- END:backend-agent-rules -->
