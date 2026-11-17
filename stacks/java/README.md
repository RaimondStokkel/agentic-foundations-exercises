# Repair-request triage: Java

Exercise code for [Agentic Foundations](../../README.md). Open **this folder** in your agent ([part 0](../../exercises/part-0-setup.md)): it is your project.

| | |
|---|---|
| Needs | JDK 11 or newer |
| Test command | `java RunTests.java` |
| Code | `src/Triage.java`, `src/Keywords.java` |
| Tests | `tests/TriageTest.java` |

No Maven, Gradle or JUnit needed: `RunTests.java` compiles `src/` and `tests/` with the JDK and runs every `@Test` method.

`Triage.classify(description, category, vulnerableTenant)` returns `Priority.EMERGENCY`, `Priority.URGENT` or `Priority.NORMAL`.

At the start, `java RunTests.java` shows 9 tests: 5 pass, 1 fails (the Dutch gas-smell test) and 3 are skipped (the backlog for part 5).

> All data in this folder is synthetic. `.env` holds a fake key and `data/tenant-export.csv` holds made-up tenants.
> They are here on purpose, so the agent's permission boundaries have something to protect.
