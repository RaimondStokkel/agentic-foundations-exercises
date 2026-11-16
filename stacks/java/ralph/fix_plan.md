# Fix plan

Ralph reads this file at the start of every iteration. One item per iteration.

- [ ] Category ignores case and extra spaces: " Heating " is an urgent category (test: "category ignores case and extra spaces")
- [ ] No hot water is urgent, whatever the category, also in Dutch: "No hot water in the shower", "Geen warm water sinds gisteren" (test: "no hot water is urgent, also in Dutch")
- [ ] Descriptions longer than 2000 characters are rejected like empty ones; exactly 2000 is fine (test: "descriptions longer than 2000 characters are rejected")

## Rules

- Change src/ only, plus this plan (tick your item and add a note). The tests in tests/ are the judge: never edit them.
- Keep every test that passes now passing.

## Notes for the next iteration
