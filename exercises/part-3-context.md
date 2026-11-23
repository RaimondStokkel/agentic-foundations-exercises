# Part 3: Context

**Optional, about 12 minutes.** We skip this part in the session of 24 Nov, because context was the topic of the
previous session. Do it when you want: every step says what to type. You see what a long file does to the agent's
context window, find a leaner way, and give the agent a memory that survives a new session.

| | |
|---|---|
| You start with | Your part 2 commit |
| You end with | A short notes file that a fresh session can pick up |

Every new session in this part starts in your stack folder, as in [part 0](part-0-setup.md#how-to-start-a-new-session).
GitHub Copilot App: before you type, check the bar under the prompt box: your stack folder, **This computer**, **Current checkout** (not **New worktree**).

Everything the agent reads stays in its **context window**: its working memory. A full window makes it slower and less
accurate. Files are its long-term memory: a new session starts with an empty window, but the files are still there.

## 1. The heavy way (4 min)

Start a **new session** in your stack folder. **Type in your agent:**

```text
Last night's pipeline failed. Read logs/nightly-test-run.log and tell me
if the failure is related to our fix.
```

Then look at how full the context window is, and note what you see:

| Agent | How |
|---|---|
| Claude desktop app | Type `/context`, or open the **Context** card in the session details panel |
| GitHub Copilot App | Type `/context` |
| Copilot CLI | Type `/context` |

The log has 649 lines. **Did the agent read all of them, or search?** If your agent searched already, that is a
valid outcome. In step 2, compare how much text each session pulled in, and whether each found enough to answer.

The log comes from the JavaScript build of the service, so it names `test/triage.test.js` in every stack. That is fine.

## 2. The lean way (3 min)

Start a **new session** in your stack folder. **Type in your agent:**

```text
Search logs/nightly-test-run.log for "not ok". Read the matching line and the few lines around it.
Which test failed? What was expected, and what actually happened?
```

Check the context again and compare it with step 1. Same answer, and the search added only a fraction of what
reading the log added. Searching beats reading everything.

The total differs less than you may expect. A new session is not empty: the harness's own instructions and tools are
already in the window. `/context` shows the parts.

## 3. Memory on disk (5 min)

In the same session, **type in your agent:**

```text
Check what we changed in part 1. Then write to notes/progress.md, in at most 5 lines:
the test that failed, what was expected and what happened, and whether this is the problem our fix solves.
```

The agent may ask for approval a few times: to look at git, to run the tests, or to create the file. Approve the new
file. For the others, approve or decline: both work.

The next session knows only what is in this file, so the notes must hold everything it needs.

Start a **new session** in your stack folder. **Type in your agent:**

```text
Read only notes/progress.md. Which test failed last night, what happened,
and how does it relate to our part 1 fix?
```

The new session knows the answer without reading the log. The notes file is the memory. Part 5 uses exactly this:
every round of the loop starts fresh and reads its memory from a file.

> **Tester focus:** compare the answer of the new session with the answer from step 1. What did the notes leave out?
> A summary always loses something. The same happens when an agent compacts its own context.
> Then check the evidence: does the log say which version of the code it tested? If not, the notes should not claim
> more than the log shows.

## Done when

- [ ] You saw the difference in context between reading the whole log and searching it.
- [ ] A fresh session answered from `notes/progress.md`.

## Think about

- What would you put in a notes file for a task that takes a whole day?
- In part 4, a helper reads the long output in its own context window. Why does that help the main agent?

Next: [Part 4: Subagents](part-4-subagents.md)
