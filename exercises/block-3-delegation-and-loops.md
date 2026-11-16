# Block 3: Delegation and loops

**About 50 minutes.** You let the agent hand work to helpers with their own context, then let it work through a
backlog on its own in a loop. That is safe because the harness from block 2 still applies.

| | |
|---|---|
| Starts from | Your block 2 commit on `my-harness`: permission rules and the guard hook |
| Leaves you with | A test-runner and a reviewer subagent, and three backlog items done by an unattended loop, each in its own commit |

- A **subagent** is a helper with its own context window, its own tools and its own model. It gets a short brief and
  returns a short summary. The rule of thumb: many readers, one writer. Let helpers search, test and review, and keep
  the code changes with one agent.
- A **loop** runs the agent again and again until a stop condition you can check. In a **Ralph loop**, every round is a
  fresh agent that knows nothing but the files. The memory lives in a plan file and in git, and the tests are the judge.

## 1. Two subagents (15 min)

> **Developer focus: you lead this step.**

Make two helpers:

- **test-runner** runs your test command and reports in a few lines. It cannot edit.
- **reviewer** reads the code and the tests and gives a verdict. It cannot edit or run commands.

### Claude Code: `.claude/agents/`

`.claude/agents/test-runner.md` (use your own test command):

```markdown
---
name: test-runner
description: Runs the test suite and reports failures in a short summary. Use proactively for every test run, and to dig through long logs, so their output stays out of the main context. Never edits files.
tools: Bash, PowerShell, Read, Grep, Glob
model: haiku
maxTurns: 10
---
You run the tests and summarise the results. You never edit files.
- Run exactly `npm test`, from the current folder. No cd, no chained commands.
- For long logs, search for the failures instead of reading the whole file.
Reply in at most 8 lines: PASS n / FAIL n / SKIPPED n, then per failure: test name, expected vs actual, file:line.
```

`.claude/agents/reviewer.md` gets `tools: Read, Grep, Glob`, `model: sonnet` and a checklist: is the public API
unchanged, were tests weakened, are the edge cases covered (capitals, Dutch and English, extra spaces, words inside
longer words)? It answers `APPROVE` or `CHANGES NEEDED` with `file:line - problem - fix`.

### Copilot: `.github/agents/`

Copilot reads custom agents from `.github/agents/`. Make three: the two helpers and a lead that has **no** terminal
tool, so it has to delegate.

```markdown
---
name: Triage Lead
description: Fixes bugs in the repair-request triage service. Delegates every test run to the Test Runner agent and every review to the Reviewer agent.
tools: ['read', 'search', 'edit', 'agent', 'todo']
---
You cannot run terminal commands. Delegate every test run to the **Test Runner** agent and every review
to the **Reviewer** agent. Never edit files in tests/. Never touch .env or data/.
```

`test-runner.agent.md` gets `tools: ['execute', 'read', 'search']` and `reviewer.agent.md` gets
`tools: ['read', 'search']`. Both get `user-invocable: false`: they are helpers for the lead, not agents you start
yourself. Their instructions are the same as for Claude Code.

Good to know: Copilot delegates with its built-in `task` tool, so name the helper in your request. Copilot also reads
`.claude/agents/`, but when the names match, `.github/agents/` wins.

### Try it

| Tool | How |
|---|---|
| Claude Code | `Use the test-runner subagent to run the tests. Then ask the reviewer subagent to review src/ against the tests.` |
| Copilot, agent mode | A new session in your stack folder with the **Copilot** target. Pick **Triage Lead** in the **Agent** dropdown, then: `Run the tests and get a review of src/.` |
| Copilot CLI | Start with `copilot --agent triage-lead` (or type `/agent triage-lead` in a running session), then the same request |

Watch the main conversation. It gets a short summary, while the test output and the files the reviewer read stay in
the helpers' own context windows.

> **Tester focus:** the reviewer is your automated colleague. Add one check of your own to its list, for example
> "every acceptance criterion has a test". Then ask it to review your block 1 change. Does it find what you found?

## 2. Switch on the backlog (10 min)

> **Tester focus: you lead this step.** In step 4 the tests are the judge. A weak judge lets bad code through.

The backlog has three requirements. Their tests are already in `tests/`, switched off.

| # | Requirement | Test |
|---|---|---|
| B1 | A category with capitals or extra spaces still counts: `" Heating "` is an urgent category | category ignores case and extra spaces |
| B2 | "No hot water" makes a request urgent whatever the category, also in Dutch ("Geen warm water") | no hot water is urgent, also in Dutch |
| B3 | A description over 2000 characters is rejected, like an empty one. Exactly 2000 is fine | descriptions longer than 2000 characters are rejected |

First read the three tests. Does each one test its requirement? Is a boundary missing? If so, add the case now.

Then switch them on:

| Stack | Switch a test on by… |
|---|---|
| JavaScript | changing `test.skip(` into `test(` |
| Python | deleting the `@unittest.skip(...)` line |
| C# | deleting `, Skip = "Backlog: switch on in block 3"` |
| Java | deleting the `@Skip(...)` line |

Run your tests: 3 should fail. Commit:

```bash
git add -A .
git commit -m "Block 3: switch on the backlog tests"
```

## 3. Write the plan and the prompt (5 min)

Create a folder `ralph` with two files. The tester writes the plan, because its items are acceptance criteria.
The developer writes the prompt.

`ralph/fix_plan.md`:

```markdown
# Fix plan

Ralph reads this file at the start of every iteration. One item per iteration.

- [ ] Category ignores case and extra spaces: " Heating " is an urgent category (test: "category ignores case and extra spaces")
- [ ] No hot water is urgent, whatever the category, also in Dutch (test: "no hot water is urgent, also in Dutch")
- [ ] Descriptions longer than 2000 characters are rejected like empty ones; exactly 2000 is fine (test: "descriptions longer than 2000 characters are rejected")

## Rules

- Change src/ only. The tests in tests/ are the judge: never edit them.
- Keep every test that passes now passing.

## Notes for the next iteration
```

`ralph/PROMPT.md` (use your own test command):

```markdown
You are one iteration of a Ralph loop on this project. You start with no memory: everything you need is in the files.

1. Read ralph/fix_plan.md. Pick the FIRST unchecked item and do only that item.
2. Change files in src/ only. Never edit tests/: the tests are the judge.
3. Run `npm test`. Every test that passed before must still pass.
4. When the test for your item passes, tick the item in ralph/fix_plan.md and add one line under "Notes for the next iteration".
5. Stop. Do not start the next item and do not commit: the loop script makes the checkpoint.
```

Commit both files: the loop refuses to start with uncommitted changes, because a rollback would throw them away.

## 4. Run the Ralph loop (10 min)

`tools/ralph.sh` is the loop. You don't need to write it, but read it: it is short. Each iteration:

1. It starts a **fresh** agent run with one instruction: read `ralph/PROMPT.md` and follow it.
2. It runs the tests itself, so it doesn't take the agent's word for the result.
3. Fewer failing tests and `tests/` untouched? It makes a **git commit**: a checkpoint. Otherwise it **rolls back** to
   the last checkpoint.
4. It stops when the plan has no unchecked items, or at the iteration cap.

Run it from your stack folder, in bash (on Windows: **Git Bash**):

```bash
bash ../../tools/ralph.sh 5 claude      # Claude Code
bash ../../tools/ralph.sh 5 copilot     # Copilot
```

- **Claude Code** works without anyone to ask, so it can only do what your `.claude/settings.json` allows. Edits to
  `tests/` are on "ask", and in a loop that means no. Your allow rules only count in a folder you trust (README, step 4).
- **Copilot** runs as the Copilot CLI with `copilot -p` (no questions asked), also if you use agent mode for the rest.
  The script passes `--trust-folder`, so your guard hook loads, and passes the allow and deny rules as flags. It allows
  every file change, which is why the script itself checks that `tests/` is untouched.
- **No Copilot CLI?** Be the loop yourself in agent mode. For each plan item, start a **New Session** (a fresh context)
  and send `Read ralph/PROMPT.md and follow its instructions exactly.` Then run the tests yourself: commit if fewer
  tests fail, otherwise `git restore src`.
- Every iteration is a fresh process: that is the fresh context.

Follow along with `git log --oneline` and `ralph/log-1.txt`, `log-2.txt` and so on.

In our runs, Claude Code finished the Python backlog in 3 iterations (92 seconds) and Copilot finished the C# backlog
in 3 iterations (147 seconds). Every iteration left a note in the plan that the next one used.

## 5. Review what the loop did (5 min)

```bash
git log --oneline -5
```

Ask your reviewer subagent to review the loop's commits, for example: `Ask the reviewer to review the changes in the
last three commits.`

The checkpoints in Claude Code and Copilot don't cover a loop's work. Git does: `git reset --hard <commit>` takes you
back to before the loop.

> **Tester focus: try to fool the loop.** Add a plan item that contradicts a test, such as "Fireplace door is loose is
> an emergency". Commit it and run the loop again. It can't make progress without breaking a test, so it rolls back
> every time and stops at the cap. What are the loop's stop conditions, and which one do you trust most?

> **Developer focus:** the script compares the *number* of failing tests (see the `shortcut:` comment): fixing two
> tests while breaking one still counts as progress. Make it compare the test names. Or add the reviewer as a sensor:
> commit only after it says `APPROVE`.

## Done when

- [ ] The test-runner and the reviewer work in your tool, and the main agent delegates to them.
- [ ] All tests pass, including the three backlog tests.
- [ ] `git log` shows one loop commit per backlog item.

## Reflect

- The agent worked without you. What made that safe: the tests, the harness, the commits or the cap?
- What would you need before you run a loop like this on a real repository? That is where the next session (5 Jan) starts.

## Stuck?

From your stack folder, `git diff HEAD block-3-solution -- .` shows the reference subagents, plan, prompt and code.
