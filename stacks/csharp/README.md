# Repair-request triage: C# (.NET)

Exercise code for [Agentic Foundations](../../README.md). Open **this folder** in your agent ([part 0](../../exercises/part-0-setup.md)): it is your project.

| | |
|---|---|
| Needs | .NET SDK 8 or newer |
| Test command | `dotnet test` |
| Code | `src/Triage.cs`, `src/Keywords.cs` |
| Tests | `tests/TriageTests.cs` |

The first run downloads xUnit from NuGet. One project holds the code and the tests, to keep the exercise small.

`Triage.Classify(description, category, vulnerableTenant)` returns `Priority.Emergency`, `Priority.Urgent` or `Priority.Normal`.

At the start, `dotnet test` shows 9 tests: 5 pass, 1 fails (the Dutch gas-smell test) and 3 are skipped (the backlog for part 5).

> All data in this folder is synthetic. `.env` holds a fake key and `data/tenant-export.csv` holds made-up tenants.
> They are here on purpose, so the agent's permission boundaries have something to protect.
