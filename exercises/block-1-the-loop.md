# Block 1: The loop

**About 40 minutes.** You watch an agent work through think, act, observe, steer it with acceptance criteria, and undo
its work with a checkpoint.

| | |
|---|---|
| Starts from | The setup in the [README](../README.md): your stack folder open as the project, on branch `my-harness` |
| Leaves you with | The failing test fixed, tests for your acceptance criteria, and your notes, committed on `my-harness` |
| Used in | Block 2 puts a harness around exactly this agent and this code |

An agent is a model in a loop. Every turn it **thinks** (what do I know, what next?), **acts** (asks the harness to
run one tool: read a file, run the tests, edit a file) and **observes** (reads what the tool returned). It stops when it
answers without asking for a tool. This pattern is called ReAct: reason plus act.

## 1. Predict before you run (5 min)

Make a file `notes/block-1.md` in your stack folder and answer these before you start the agent:

- What will the agent do first?
- How many tool calls will it need to fix the failing test?
- Which files will it read? Which will it change?

> **Tester focus:** also write down what could go wrong. Two classics: the agent changes the *test* instead of the
> code, and the fix passes the test but breaks something nobody tested.

## 2. Watch one loop (10 min)

Start the agent so that it asks before it acts:

| Tool | How |
|---|---|
| Claude Code | `claude --permission-mode default` |
| Copilot | `copilot` (it asks before it runs a command or changes a file) |

Give it this task:

```text
Fix the failing priority test without changing the public API.
```

Before you approve each step, say (or type) what you expect it to return. Then fill in this table in your notes:

| # | Thought: why this step? | Action: tool and input | Observation: what came back |
|---|---|---|---|
| 1 | | | |

Claude Code and Copilot both show every tool call. The text between the calls is the "thought".

When it is done, compare with your prediction. **Which observation changed the agent's plan?**

## 3. Check the result (5 min)

Run your test command yourself, then look at what changed:

```bash
git diff --stat
git diff
```

> **Developer focus:** does the fix also handle these? Try them, for example in a scratch test.
>
> - `"GAS   SMELL near the meter"`: capitals and extra spaces. Should be an emergency.
> - `"Brandweer heeft de deur geforceerd"`, category `lock`: "brand" (fire) appears only inside a longer word.
>   Should stay urgent, not become an emergency.
> - `"Fireplace door is loose"`: "fire" inside a longer word. Should stay normal.
>
> When we tested this block, Claude Code and Copilot both passed the failing test in about 30 seconds.
> Both fixes ignored capitals but still matched keywords with a plain "contains". So "Fireplace door is loose"
> became an emergency, and "GAS   SMELL" with extra spaces did not. The test passed, but the requirement was not met.

> **Tester focus:** did the agent change anything in `tests/`? A test that passes because its expectation was changed
> proves nothing. Then pick one of the inputs above and decide: is this a bug, or a missing requirement?

## 4. Rewind, then steer with acceptance criteria (10 min)

Undo the agent's work with a **checkpoint**, not with git:

| Tool | How |
|---|---|
| Claude Code | Press `Esc` twice (or type `/rewind`), pick the point before your task, choose to restore code and conversation |
| Copilot | Type `/rewind` (or `/undo`), pick the turn before your task, choose to restore the conversation and the files |

Run the tests: you are back to 1 failing test.

> **Tester focus:** write the acceptance criteria. Use your notes from step 3. One way to write them:
> *Given a request "…" with category "…", when it is classified, then the priority is "…".*

Now give the agent the task again, with your criteria. For example:

```text
Fix the failing priority test without changing the public API.
Acceptance criteria:
- "Gaslucht in de keuken" (Dutch for gas smell) is an emergency.
- Capitals and extra spaces don't matter: "GAS   SMELL near the meter" is an emergency.
- Whole words only: "Brandweer heeft de deur geforceerd" with category lock stays urgent,
  and "Fireplace door is loose" stays normal.
Add a test for each criterion. Do not change the existing tests.
```

Compare with the first run. Count the steps, the files it touched, and whether the result meets every criterion.
**Which run would you trust in a real repository?**

> **Good to know:** a checkpoint undoes the edits the agent made with its own edit tools. It does not undo shell
> commands, a push, a deployment or a message that was sent. That is why block 2 exists.

## 5. Context: the noisy log (5 min)

Everything the agent reads stays in its context window, and a full window makes it slower and less accurate.
Ask:

```text
Last night's pipeline failed. Read logs/nightly-test-run.log and tell me if the failure is related to our fix.
```

Type `/context` before and after, in Claude Code or in Copilot. How much of the window did one log file take?
And how did the agent read it: all 649 lines, or a search?

Then try it the lean way, in a new session:

```text
Search logs/nightly-test-run.log for failed tests ("not ok") and summarise them in 3 lines.
```

Same answer, a fraction of the context. Searching beats reading everything. In block 3 a subagent will do this
kind of reading for you, in its own context window.

## 6. Commit (2 min)

You commit, not the agent:

```bash
git add -A .
git commit -m "Block 1: classify Dutch and mixed-case emergencies"
```

## Done when

- [ ] Your test command shows no failing tests (the 3 backlog tests are still skipped).
- [ ] There is a test for each of your acceptance criteria.
- [ ] Your notes have the predictions and the think/act/observe table.
- [ ] Everything is committed on `my-harness`.

## Reflect

- Where did the agent surprise you: in what it read, in what it skipped, or in when it stopped?
- What did the acceptance criteria change in the agent's work?
- Where in this loop would you want a check that the agent cannot skip? (Block 2.)

## Stuck?

From your stack folder, `git diff HEAD block-1-solution -- .` shows a reference fix with the two extra tests.
