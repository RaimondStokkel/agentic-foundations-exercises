# Repair-request triage: Python

Exercise code for [Agentic Foundations](../../README.md). Start Claude Code (`claude`) or Copilot (`copilot`) in **this folder**: it is your project.

| | |
|---|---|
| Needs | Python 3.10 or newer |
| Test command | `python -m unittest` |
| Code | `src/triage.py`, `src/keywords.py` |
| Tests | `tests/test_triage.py` |

No packages to install: the tests use the standard library. On Windows, use `py -m unittest` if `python` is not on your PATH.

`classify_repair_request(description, category=None, vulnerable_tenant=False)` returns `"emergency"`, `"urgent"` or `"normal"`.

At the start, `python -m unittest` shows 9 tests: 5 pass, 1 fails (the Dutch gas-smell test) and 3 are skipped (the backlog for block 3).

> All data in this folder is synthetic. `.env` holds a fake key and `data/tenant-export.csv` holds made-up tenants.
> They are here on purpose, so the agent's permission boundaries have something to protect.
