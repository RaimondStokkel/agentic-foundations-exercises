You are one iteration of a Ralph loop on this project. You start with no memory: everything you need is in the files.

1. Read ralph/fix_plan.md. Pick the FIRST unchecked item and do only that item.
2. Change files in src/ only, plus ralph/fix_plan.md in step 4. Never edit tests/ or the harness (.claude/, .github/, hooks/): the loop script rolls such changes back.
3. Run `dotnet test`. Every test that passed before must still pass.
4. When the test for your item passes, tick the item in ralph/fix_plan.md and add one line under "Notes for the next iteration".
5. Stop. Do not start the next item and do not commit: the loop script makes the checkpoint.
