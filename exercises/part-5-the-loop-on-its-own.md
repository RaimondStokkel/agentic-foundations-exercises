# Part 5: The loop on its own

**20 minutes.** The agent works through a backlog one item at a time, every round with a fresh context. The tests are
the judge, git commits are the checkpoints, and you are the loop.

| | |
|---|---|
| You start with | Your part 4 commit |
| You end with | Three backlog items done, each in its own commit, and a review of the result |

This is a **Ralph loop**: run the same short prompt again and again, each time in a fresh session. The agent remembers
nothing between rounds. Its memory is a plan file and git, as in part 3.

## 1. Switch on the backlog (4 min)

> **Tester focus:** the tests are the judge. A weak judge lets bad code through.

The backlog has three requirements. Their tests are already in `tests/`, switched off (marked as backlog):

| # | Requirement |
|---|---|
| B1 | A category with capitals or extra spaces still counts: `" Heating "` is an urgent category |
| B2 | "No hot water" makes a request urgent, whatever the category, also in Dutch ("Geen warm water") |
| B3 | A description over 2000 characters is rejected, like an empty one. Exactly 2000 is fine |

**Type in your agent:**

```text
Switch on the three skipped backlog tests in tests/: remove only their skip markers and change nothing else.
Run the tests and tell me how many fail. Then commit with the message: Part 5: switch on the backlog tests
```

Approve the test change. **You should see:** 3 failing tests.

## 2. Write the plan and the prompt (4 min)

**Type in your agent:**

```text
Create two files with exactly this content, then commit them with the message: Part 5: plan and prompt

File ralph/fix_plan.md:
# Fix plan

One item per round.

- [ ] Category ignores case and extra spaces: " Heating " is an urgent category (test: "category ignores case and extra spaces")
- [ ] No hot water is urgent, whatever the category, also in Dutch (test: "no hot water is urgent, also in Dutch")
- [ ] Descriptions longer than 2000 characters are rejected like empty ones; exactly 2000 is fine (test: "descriptions longer than 2000 characters are rejected")

## Rules

- Change src/ only, plus this plan (tick your item and add a note). The tests in tests/ are the judge: never edit them.
- Keep every test that passes now passing.

## Notes for the next round

File ralph/PROMPT.md:
You are one round of a loop on this project. You start with no memory: everything you need is in the files.

1. Read ralph/fix_plan.md. Pick the FIRST unchecked item and do only that item.
2. Change files in src/ only, plus ralph/fix_plan.md in step 4. Never edit tests/ or the harness (.claude/, .github/, hooks/).
3. Run the test command from README.md. Every test that passed before must still pass.
4. When the test for your item passes, tick the item in ralph/fix_plan.md and add one line under "Notes for the next round".
5. Stop. Do not start the next item and do not commit: whoever runs the loop makes the checkpoint.
```

> **Tester focus:** read the plan. Does each item say the same as its test? Is a boundary missing?

## 3. Be the loop (10 min)

Let the agent work without asking for every edit:

| Agent | How |
|---|---|
| Claude desktop app | Mode selector: **Accept edits**. Your rules still apply: a change in `tests/` still asks, and a push or `.env` stays blocked |
| Copilot, Agents window | Use the normal **Agent**, not Triage Lead. Keep **Manual permissions** and approve edits in `src/` and `ralph/` only |
| Copilot CLI | `/exit`, then start with your flags from part 2 plus `--allow-tool write` |

Then do **one round per plan item**, three rounds in all:

1. Start a **new session** in your stack folder. That is the fresh context.
2. **Type in your agent:** `Read ralph/PROMPT.md and follow its instructions exactly.` If it asks to run the tests,
   approve it.
3. When it stops, **type in your agent:** `Run the tests, and show me git status.`
4. **Judge.** Fewer failing tests, and nothing changed in `tests/`, `.claude/`, `.github/` or `hooks/`?
   - Yes: **type** `Commit everything with the message: loop round 1` (2, 3).
   - No: **type** `Throw away all changes since the last commit.` Then try the round again.

A round takes one or two minutes. Every round leaves a note in the plan, and the next round reads it.

## 4. Review what the loop did (2 min)

**Type in your agent:**

```text
Write the changes to src/ since the commit "Part 5: plan and prompt" to notes/loop.diff.
Then ask the reviewer to review notes/loop.diff.
```

Checkpoints in the agent don't cover a loop's work across sessions. Git does: every round is a commit you can go back to.

## Done when

- [ ] All tests pass, including the three backlog tests.
- [ ] The git log shows one commit per round.
- [ ] The reviewer reviewed the loop's work.

## Think about

- The agent worked without you watching each step. What made that safe: the tests, the harness, the commits, or you?
- **Try to fool the loop:** add a plan item that contradicts a test, such as "Fireplace door is loose is an emergency".
  What happens in the round, and what do you do as the judge?
- What would you need before you run a loop like this on a real repository? That is where the next session (5 Jan)
  starts.

## Extra: the loop as a script

With the Copilot CLI or the Claude Code CLI installed, a script can be the loop instead of you. In **Git Bash**, from
your stack folder:

```bash
bash ../../tools/ralph.sh 5 copilot     # or: bash ../../tools/ralph.sh 5 claude
```

The script does what you did in step 3. It starts a fresh agent run per round, runs the tests itself, commits when
there is progress and rolls back when there isn't, and checks that `tests/` and the harness are untouched. It stops
when the plan is done or after 5 rounds. When we tested it, it finished the backlog in 3 rounds with Claude Code
(Python, Java) and Copilot (C#, Python).

> **Developer focus:** the script compares the *number* of failing tests (see the `shortcut:` comment in
> `tools/ralph.sh`). Fixing two tests while breaking one still counts as progress. Make it compare the test names.
> `bash tools/test-ralph.sh` (from the repo root) tests the script without calling a model.

## Stuck or behind?

Stuck: raise your hand in Teams, or post in the Teams chat.
Out of time? **Type in your agent:**

```text
Take src, tests and ralph from the git tag block-3-solution and commit them with the message:
Part 5 from the solution
```
