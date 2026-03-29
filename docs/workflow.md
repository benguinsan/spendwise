# Agent workflow for coding

This document describes how coding agents should combine **repository rules**, **command playbooks**, and **area-specific guides** when working in SpendWiseApp.

## Layering (apply in this order)

1. **`.cursorrules` (repository root)**  
   Always follow project-wide constraints: stack, scope, style, and anything the maintainers want enforced on every task. If something here conflicts with a generic habit, **`.cursorrules` wins**.

2. **Area-specific agent guides**  
   Deeper rules for a subtree override generic assumptions for that subtree only.  
   - **Frontend**: `frontend/AGENTS.md` — SpendWise UI expectations, Next.js/React/Tailwind notes, and the in-repo Next.js disclaimer (read `node_modules/next/dist/docs/` when changing Next APIs or structure).  
   When adding other packages (e.g. `backend/`), add an `AGENTS.md` there if the team wants the same pattern.

3. **`docs/commands/` playbooks**  
   These are **procedure templates** for specific kinds of work. They do not replace `.cursorrules` or `AGENTS.md`; they tell the agent *what to produce* and *how to sequence* optional steps (e.g. plan → implement → review → document).

4. **`README.md` and operational docs**  
   Use for how to run the app (Docker, ports, DB). Prefer them over guessing env vars or URLs.

## Command playbooks (`docs/commands/`)

Invoke the relevant playbook when the user (or task) matches that intent:

| File | Use when |
|------|----------|
| [`create_brief.md`](commands/create_brief.md) | Capturing product context into `docs/PRODUCT_BRIEF.md` (or path the user gives). |
| [`plan_feature.md`](commands/plan_feature.md) | Turning a feature description into a technical plan in `docs/features/<N>_PLAN.md`. |
| [`code_review.md`](commands/code_review.md) | Reviewing an implementation against its plan; output goes to `docs/features/<N>_REVIEW.md` unless specified otherwise. |
| [`write_docs.md`](commands/write_docs.md) | Updating docs after a feature lands; **code is source of truth** over plans/reviews if they disagree. |

Other files in `docs/commands/` (for example `test.md`) are used when non-empty and relevant to the task.

## Typical feature flow (suggested)

Not every task needs every step; match the user’s ask.

1. **Brief** — Optional: [`create_brief.md`](commands/create_brief.md) when product context is missing or stale.  
2. **Plan** — [`plan_feature.md`](commands/plan_feature.md) before large or ambiguous implementation.  
3. **Implement** — Follow `.cursorrules`, then `frontend/AGENTS.md` (or future area guides) for touched paths.  
4. **Review** — [`code_review.md`](commands/code_review.md) after implementation when quality or plan alignment matters.  
5. **Docs** — [`write_docs.md`](commands/write_docs.md) when behavior or user-facing surfaces changed and docs should match.

## Practical rules for agents

- **Scope**: Change only what the task requires; match existing patterns in the directory you edit.  
- **Frontend work**: Open `frontend/AGENTS.md` before assuming default Next.js or public-docs behavior.  
- **Commands vs rules**: Playbooks describe *deliverables and file targets*; `.cursorrules` and `AGENTS.md` describe *ongoing constraints*.  
- **Ambiguity**: Prefer asking a short clarifying question over inventing product or API behavior.
