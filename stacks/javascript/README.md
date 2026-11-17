# Repair-request triage: JavaScript

Exercise code for [Agentic Foundations](../../README.md). Open **this folder** in your agent ([part 0](../../exercises/part-0-setup.md)): it is your project.

| | |
|---|---|
| Needs | JavaScript (Node.js 20 or newer) |
| Test command | `npm test` |
| Code | `src/triage.js`, `src/keywords.js` |
| Tests | `tests/triage.test.js` |

No packages to install: the tests use Node's built-in test runner.

`classifyRepairRequest({ description, category, vulnerableTenant })` returns `'emergency'`, `'urgent'` or `'normal'`.

At the start, `npm test` shows 9 tests: 5 pass, 1 fails (the Dutch gas-smell test) and 3 are skipped (the backlog for part 5).

> All data in this folder is synthetic. `.env` holds a fake key and `data/tenant-export.csv` holds made-up tenants.
> They are here on purpose, so the agent's permission boundaries have something to protect.
