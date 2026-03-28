# Command: Create brief

Use this when starting a feature or change so scope and success criteria are clear before coding.

## How to use

Paste the block below into chat, fill the brackets, and send.

```
Create a brief for this work:

**Feature / change:** [one line]
**Problem:** [what user pain or gap this fixes]
**Audience:** [who uses it — e.g. end user, admin, API consumer]
**Must-haves:** [bullets — non-negotiable behaviors]
**Nice-to-haves:** [optional]
**Out of scope:** [what we are explicitly not doing]
**Success:** [how we know it’s done — measurable or demoable]
**Constraints:** [time, tech, compliance, performance]
**Open questions:** [unknowns to resolve]

Output: a short brief (≤1 page) I can put in docs/ or attach to a PR.
```

## Example (filled)

```
Create a brief for this work:

**Feature / change:** Export transactions as CSV from the dashboard
**Problem:** Users need offline backups and spreadsheet analysis; copy-paste is error-prone
**Audience:** Logged-in users on the web app
**Must-haves:** Filter by date range; CSV columns: date, amount, category, note; UTF-8
**Nice-to-haves:** Preset date ranges (this month, last month)
**Out of scope:** PDF, scheduled email exports, API bulk export
**Success:** User can download CSV matching filters; opens cleanly in Excel/Sheets
**Constraints:** No new paid services; must work in existing auth/session model
**Open questions:** Max rows per export? Rate limit?

Output: a short brief (≤1 page) I can put in docs/ or attach to a PR.
```
