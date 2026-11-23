# Part 4: Subagents

**25 minutes.** You give the agent two helpers, each with its own context window and only the tools it needs.
Then you watch the agent hand work to them.

| | |
|---|---|
| You start with | Your part 2 commit. Part 3 is optional and not needed here |
| You end with | A test-runner and a reviewer, committed, and one run where the agent delegated to both |

A **subagent** is a helper with its own context window, its own tools and its own model. It gets a short brief and
returns a short summary. The rule of thumb: **many readers, one writer.** Helpers search, test and review. One agent
changes the code.

## 1. Make two helpers (6 min)

> **Developer focus:** the tools list of each helper is its boundary. Read it before you approve the file.

- The **test-runner** runs the tests and reports in a few lines. It has no edit tool, and it runs on a cheaper, faster
  model: running tests needs no deep thinking.
- The **reviewer** reads the code and the tests and gives a verdict. It can't edit or run anything.

Paste the block for your agent as a whole. You don't need to understand every line: the agent turns it into the files.

**Claude desktop app. Type in your agent:**

```text
Create two subagents in .claude/agents/ in this folder.
1. test-runner.md: tools Bash, PowerShell, Read, Grep, Glob; model haiku; maxTurns 10.
   Description: "Runs the test suite and reports failures in a short summary. Use proactively for every
   test run, and to dig through long logs. Never edits files."
   Instructions: run exactly the test command from README.md, from the current folder; never change files;
   search long logs instead of reading them whole. Reply in at most 8 lines: PASS n / FAIL n / SKIPPED n,
   then per failure: test name, expected vs actual, file:line.
2. reviewer.md: tools Read, Grep, Glob; model sonnet.
   Description: "Read-only code reviewer. Use proactively after any code change. Never edits files."
   Instructions: you cannot run git, so the caller gives you the changed files or a diff file.
   Check: public API unchanged; no test deleted, skipped or weakened; edge cases covered (capitals,
   Dutch and English, extra spaces, keywords inside longer words such as "Fireplace").
   While the three tests marked Backlog are skipped, they and their requirements are for part 5 and never block.
   Any other skipped or weakened test does.
   Only a blocking defect (wrong behaviour, a weakened test, a changed API, a missed requirement) makes the
   verdict CHANGES NEEDED. Reply in at most 12 lines: Verdict (APPROVE or CHANGES NEEDED),
   Blocking (file:line - problem - fix, or none), Suggestions (not blocking, at most 3).
```

**Copilot (GitHub Copilot App and CLI). Type in your agent:**

```text
Create three custom agents in .github/agents/ in this folder, not in the repository root.
1. triage-lead.agent.md: name Triage Lead; tools ['read', 'search', 'edit', 'agent', 'todo'], so no terminal.
   It fixes bugs in this triage service. It delegates every test run to the Test Runner agent and every
   review to the Reviewer agent. It never edits tests/ and never touches the secrets file or data/.
   It fixes every blocking finding before it finishes; suggestions are optional. It leaves the skipped
   Backlog tests and their requirements for part 5.
2. test-runner.agent.md: name Test Runner; tools ['execute', 'read', 'search']; user-invocable: false.
   It runs exactly the test command from README.md, never changes files, searches long logs instead of
   reading them whole, and replies in at most 8 lines: PASS n / FAIL n / SKIPPED n, then per failure:
   test name, expected vs actual, file:line.
3. reviewer.agent.md: name Reviewer; tools ['read', 'search']; user-invocable: false.
   It cannot run git, so the caller gives it the changed files or a diff file.
   Check: public API unchanged; no test deleted, skipped or weakened; edge cases covered (capitals,
   Dutch and English, extra spaces, keywords inside longer words such as "Fireplace").
   While the three tests marked Backlog are skipped, they and their requirements are for part 5 and never block.
   Any other skipped or weakened test does.
   Only a blocking defect (wrong behaviour, a weakened test, a changed API, a missed requirement) makes the
   verdict CHANGES NEEDED. Reply in at most 12 lines: Verdict (APPROVE or CHANGES NEEDED),
   Blocking (file:line - problem - fix, or none), Suggestions (not blocking, at most 3).
```

Approve the changes: the agents live in the harness folders, so your rules ask first.

## 2. Check them against the list (2 min)

**Type in your agent:** `Show me the agent files you made.` Check them against this list:

- The description says *when* to use the helper.
- The tools are a short list. The reviewer has no edit tool and no shell. The test-runner has no edit tool.
- The reply format is short and fixed.
- Only one agent writes code.

> **Developer focus:** the reviewer can only read and search. The test-runner also has a shell. Which of the two is
> technically unable to change a file, and which one only promises not to?

> **Tester focus:** a file that doesn't match the list is a bug in the harness. Tell the agent what is wrong and ask
> it to fix the file.

## 3. Watch the agent delegate (8 min)

The agent loads its helpers when a session starts. Start a **new session** in your stack folder, as in
[part 0](part-0-setup.md#how-to-start-a-new-session):

| Agent | How, and what to type |
|---|---|
| Claude desktop app | **+ New**, then: `Use the test-runner subagent to run the tests. Then ask the reviewer subagent to review src/ against the tests.` |
| GitHub Copilot App | **+** next to **Sessions**. Before you type, check the bar under the prompt box: your stack folder, **This computer**, **Current checkout** (not **New worktree**). Pick **Triage Lead** in the agent picker in the prompt box, then: `Run the tests and get a review of src/.` |
| Copilot CLI | `/exit`, then start with your flags plus `--agent triage-lead`. Then: `Run the tests and get a review of src/.` |

Watch the main conversation. It gets a short summary from each helper. The test output and the files the reviewer read
stay in the helpers' own context windows.

## 4. Fix the blocking findings (3 min)

**What did the reviewer say?** If it found a blocking problem, **type in your agent:**

```text
Fix the blocking findings. Leave the skipped Backlog tests and their requirements for part 5.
```

Then watch the agent call the helpers again.

> **Tester focus:** the reviewer is your automated colleague. Ask the agent to add one check of your own to the
> reviewer, for example "every acceptance criterion has a test". Run step 3 again. Does it find what you would find?

## 5. Commit (1 min)

**Copilot users, switch agents first.** Triage Lead has no terminal, but it may still commit by handing the job to a
helper. It refuses part 5, though: its instructions forbid changes in `tests/`, and part 5 starts by switching on the
backlog tests. So switch back to the default agent now:

| Agent | How |
|---|---|
| GitHub Copilot App | In the agent picker in the prompt box, switch from **Triage Lead** back to the default agent |
| Copilot CLI | `/exit`, then start with your flags from part 2, without `--agent triage-lead` |

Stay with the default agent for part 5.

**Type in your agent:**

```text
Commit all changes with the message: Part 4: test-runner and reviewer subagents
```

## Done when

- [ ] The main agent delegated a test run and a review.
- [ ] The helpers are committed.

## Think about

- Which jobs in your own work could a read-only helper do?
- The helper only knows its brief. What must the main agent put in that brief?

## Stuck or behind?

Stuck: raise your hand in Teams, or post in the Teams chat.

**The agent names or changes other stacks?** Then the session runs in the wrong folder. Start a new session in your
stack folder, as in [part 0](part-0-setup.md#how-to-start-a-new-session). Did it change files there? **Type in the new session:**
`Undo every change outside this folder with git restore and git clean.`

Out of time? Copilot users: switch back to the default agent first (see step 5).
**Type in your agent:**

```text
Take .claude/agents and .github/agents from the git tag block-3-solution and commit them
with the message: Part 4 from the solution
```

Then start a new session in your stack folder, as in [part 0](part-0-setup.md#how-to-start-a-new-session), so the helpers load.

Next: [Part 5: The loop on its own](part-5-the-loop-on-its-own.md)
