# Command: Plan feature

Use after you have a brief (or a clear one-liner) to get an implementation plan before writing code.

## How to use

Paste the block below, fill the brackets, and send.

```
Plan implementation for:

**Brief / goal:** [paste brief summary or link to doc]
**Repo context:** [e.g. backend FastAPI + Postgres, frontend React — adjust to SpendWise stack]
**Preferences:** [e.g. smallest change first, or “match existing patterns in X”]

Please produce:
1. **Phases** — ordered steps (DB → API → UI or whatever fits)
2. **Files / areas** likely to touch (paths if you infer them from the repo)
3. **Risks & mitigations**
4. **Test / verification** — what to run or manually check
5. **Rollout** — feature flag, migration order, backward compatibility

Keep the plan concise; no full code yet unless a tiny interface sketch helps.
```

## Example (filled)

```
Plan implementation for:

**Brief / goal:** Export transactions as CSV (date range + filters, UTF-8 CSV)
**Repo context:** SpendWise — Dockerized backend + DB; follow existing routes and auth
**Preferences:** Match existing export/report patterns; add tests where we already test API

Please produce:
1. **Phases** — ordered steps (DB → API → UI or whatever fits)
2. **Files / areas** likely to touch (paths if you infer them from the repo)
3. **Risks & mitigations**
4. **Test / verification** — what to run or manually check
5. **Rollout** — feature flag, migration order, backward compatibility

Keep the plan concise; no full code yet unless a tiny interface sketch helps.
```
