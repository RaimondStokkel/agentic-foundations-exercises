# Part 5: The loop on its own

**20 minutes.** The agent works through a backlog one item at a time, every round with a fresh context. The tests are
the judge, git commits are the checkpoints, and you are the loop.

| | |
|---|---|
| You start with | Your part 4 commit |
| You end with | Three backlog items done, each in its own commit, and a review of the result |

In part 1 the loop was **inside** the agent: one session, and the model decided when to stop. This loop goes
**around** the agent: every round is a new session, and the tests decide whether the round counts. Inside each round,
the agent still runs the loop from part 1.

This is a **Ralph loop**: run the same short prompt again and again, each time in a fresh session. The agent remembers
nothing between rounds. Its memory is a plan file and git: notes on disk, not the conversation.

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

Approve the test change. **You should see:** 3 failing tests. Fewer? Then your agent already did a backlog item
earlier, and its round in step 3 only ticks it off.

## 2. Get the plan and the prompt (4 min)

The loop needs two small files: a **plan** with one item per backlog test (the memory), and a **prompt** that every
round gets (the instructions). Both are ready-made in the repo.

**Type in your agent:**

```text
Take the folder ralph/ from the git tag block-3-solution and commit it with the message:
Part 5: plan and prompt. Then show me ralph/fix_plan.md and ralph/PROMPT.md.
```

Read both. Where the prompt says "the loop script", that is you in step 3.

> **Tester focus:** does each plan item say the same as its test? Is a boundary missing?

## 3. Be the loop (8 min)

Let the agent work without asking for every edit:

| Agent | How |
|---|---|
| Claude desktop app | Mode selector: **Accept edits**. Your rules still apply: a change in `tests/` still asks, and a push or `.env` stays blocked |
| GitHub Copilot App | Use the default agent, not Triage Lead. Keep **Always ask** and approve edits in `src/` and `ralph/` only |
| Copilot CLI | `/exit`, then start with your flags from part 2 plus `--allow-tool write` |

Then do **one round per plan item**, three rounds in all:

1. Start a **new session** in your stack folder. That is the fresh context. GitHub Copilot App: pick your stack
   folder, not `agentic-foundations-exercises`.
2. **Type in your agent:** `Read ralph/PROMPT.md and follow its instructions exactly.` If it asks to run the tests,
   approve it.
3. When it stops, **type in your agent:** `Run the tests, list the failing tests by name, say which plan item you
   ticked, and show me git status.`
4. **Judge.** The test of the ticked item passes, there are fewer failing tests (or as many, if that test already
   passed before the round), no test fails that passed before, and nothing changed in `tests/`, `.claude/`,
   `.github/` or `hooks/`?
   - Yes: **type** `Commit everything with the message: loop round 1` (2, 3).
   - No: **type** `Throw away all changes since the last commit.` Then try the round again.

A round takes one or two minutes. Every round leaves a note in the plan, and the next round reads it.
A good run goes from 3 failing tests to 2, then 1, then 0. Look at the names as well as the count: a lower count can
hide a test that broke.

## 4. Review what the loop did (2 min)

**Type in your agent:**

```text
Create the folder notes if it is missing. Write the changes to src/ since the commit
"Part 5: plan and prompt" to notes/loop.diff. Then ask the reviewer to review notes/loop.diff.
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

The script does the rounds of step 3 for you, with a simpler check: it counts the failing tests, where you compared
them by name. It starts a fresh agent run per round, runs the tests itself, commits when
there is progress and rolls back when there isn't, and checks that `tests/` and the harness are untouched. It stops
when the plan is done or after 5 rounds. When we tested it, it finished the backlog in 3 rounds with Claude Code
(Python, Java) and Copilot (C#, Python).

## Stuck or behind?

Stuck: raise your hand in Teams, or post in the Teams chat.

**The agent names or changes other stacks?** Then the session runs in the wrong folder. Start a new session in your
stack folder, the path you wrote down in part 0 (GitHub Copilot App: pick your stack folder, not
`agentic-foundations-exercises`). Did it change files there? **Type in the new session:**
`Undo every change outside this folder with git restore and git clean.`

Out of time? **Type in your agent:**

```text
Take src, tests and ralph from the git tag block-3-solution and commit them with the message:
Part 5 from the solution
```
