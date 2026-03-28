# Command: Code review

Use before merge or when you want a focused pass on a branch or diff.

## How to use

Paste the block below, fill the brackets, and send.

```
Code review request:

**Scope:** [branch name, PR link, or list of files / `@path`]
**Intent of change:** [one paragraph — what this PR is supposed to do]
**Risk areas:** [auth, money, migrations, concurrency — or “none known”]

Review for:
- Correctness & edge cases
- Security (injection, authz, secrets)
- Performance & DB/query impact
- Tests: gaps vs. critical paths
- Style consistency with this repo

Output format:
1. **Summary** (2–4 bullets)
2. **Must-fix** (blocking issues)
3. **Should-fix** (non-blocking but important)
4. **Nits** (optional)
```

## Example (filled)

```
Code review request:

**Scope:** `feature/transaction-csv-export` — backend route + tests
**Intent of change:** Add GET endpoint that streams CSV of transactions for the logged-in user, filtered by query params
**Risk areas:** Authorization (only own data), large result sets / memory

Review for:
- Correctness & edge cases
- Security (injection, authz, secrets)
- Performance & DB/query impact
- Tests: gaps vs. critical paths
- Style consistency with this repo

Output format:
1. **Summary** (2–4 bullets)
2. **Must-fix** (blocking issues)
3. **Should-fix** (non-blocking but important)
4. **Nits** (optional)
```
