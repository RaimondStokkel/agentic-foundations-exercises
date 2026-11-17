# Part 3: Context

**12 minutes.** You see what a long file does to the agent's context window, find a leaner way, and give the agent a
memory that survives a new session.

| | |
|---|---|
| You start with | Your part 2 commit |
| You end with | A short notes file that a fresh session can pick up |

Everything the agent reads stays in its **context window**: its working memory. A full window makes it slower and less
accurate. Files are its long-term memory: a new session starts with an empty window, but the files are still there.

## 1. The heavy way (4 min)

Start a **new session** in your stack folder. **Type in the chat:**

```text
Last night's pipeline failed. Read logs/nightly-test-run.log and tell me
if the failure is related to our fix.
```

Then look at how full the context window is:

| Agent | How |
|---|---|
| Claude desktop app | The usage ring next to the model picker, or type `/context` |
| Copilot, Agents window | Look at how the agent read the log: the whole file or a search? |
| Copilot CLI | Type `/context` |

The log has 649 lines. **Did the agent read all of them, or search?**

## 2. The lean way (3 min)

Start a **new session**. **Type in the chat:**

```text
Search logs/nightly-test-run.log for failed tests ("not ok") and summarise them in 3 lines.
```

Check the context again. Same answer, a fraction of the context. Searching beats reading everything.

## 3. Memory on disk (5 min)

In the same session, **type in the chat:**

```text
Write what you found to notes/progress.md, in at most 5 lines.
```

Start a **new session**. **Type in the chat:**

```text
Read notes/progress.md. Which test failed last night, and is it related to our fix?
```

The new session knows the answer without reading the log. The notes file is the memory. Part 5 uses exactly this:
every round of the loop starts fresh and reads its memory from a file.

> **Tester focus:** compare the answer of the new session with the answer from step 1. What did the notes leave out?
> A summary always loses something. The same happens when an agent compacts its own context.

## Done when

- [ ] You saw the difference in context between reading the whole log and searching it.
- [ ] A fresh session answered from `notes/progress.md`.

## Think about

- What would you put in a notes file for a task that takes a whole day?
- In part 4, a helper reads the long output in its own context window. Why does that help the main agent?

Next: [Part 4: Subagents](part-4-subagents.md)
