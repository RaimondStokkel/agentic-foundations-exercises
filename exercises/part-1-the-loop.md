# Part 1: The loop

**25 minutes.** You watch the agent think, act and observe. Then you steer it with acceptance criteria and undo its
work with a checkpoint.

| | |
|---|---|
| You start with | Part 0 done: a session in your stack folder, 1 failing test |
| You end with | The failing test fixed, a test for each of your acceptance criteria, committed |

An agent is a model in a loop. Every turn it **thinks** (what do I know, what next?), **acts** (asks for one tool:
read a file, run the tests, edit a file) and **observes** (reads what came back). It stops when it answers without
asking for a tool.

## 1. Make the agent ask first (1 min)

| Agent | How |
|---|---|
| Claude desktop app | In the mode selector under the prompt box, choose **Manual** |
| Copilot, Agents window | In the permissions picker under the prompt, choose **Manual permissions** |
| Copilot CLI | Nothing to do: it asks before it runs a command or changes a file |

## 2. Predict (3 min)

Before you start the agent, write down your answers, on paper or in the meeting chat:

- What will the agent do first?
- How many steps (tool calls) will it need?
- Which files will it change?

> **Tester focus:** also write down what could go wrong. Two classics: the agent changes the *test* instead of the
> code, or the fix passes the test but breaks something nobody tested.

## 3. Watch one loop (7 min)

**Type in the chat:**

```text
Fix the failing priority test without changing the public API.
```

Before you approve a step, say what you expect it to return. Keep a short tally like this one:

| # | Thought: why this step? | Action: which tool, on what? | Observation: what came back? |
|---|---|---|---|
| 1 | | | |

The text the agent writes between its steps is the "thought". Every tool call it shows you is an "action".

When it is done, compare with your prediction. **How many steps did it take? Which observation changed its plan?**

## 4. Check the result (5 min)

**Type in the chat:**

```text
Which files did you change? Then, without changing any files, classify these three requests
and tell me the priority of each:
1. "GAS   SMELL near the meter", category heating
2. "Brandweer heeft de deur geforceerd" (Dutch: the fire brigade forced the door), category lock
3. "Fireplace door is loose", no category
```

**The right answers:** 1 is an emergency (capitals and extra spaces don't matter). 2 is urgent: "brand" (fire) is
only part of a longer word. 3 is normal: "fire" is only part of "Fireplace".

When we tested this, both Claude Code and Copilot fixed the failing test in about 30 seconds. Both fixes still made
"Fireplace door is loose" an emergency, and missed "GAS   SMELL" with the extra spaces. The test passed, but the
requirement was not met.

> **Tester focus:** did the agent change anything in `tests/`? A test that passes because its expectation was changed
> proves nothing. Then pick one wrong answer above and decide: is this a bug, or a requirement nobody wrote down?

## 5. Undo with a checkpoint (3 min)

Take the agent's work back:

| Agent | How |
|---|---|
| Claude desktop app | Type `/rewind`. Pick the point before your task and choose **Restore code and conversation** |
| Copilot, Agents window | Open the **Changes** view (**Last Turn**) to see what changed. Then type: `Undo all changes in src and tests with git restore and git clean.` |
| Copilot CLI | Type `/rewind`. Pick the turn before your task and restore the files and the conversation |

**Type in the chat:** `Run the tests.` You should be back to 1 failing test.

> **Good to know:** a checkpoint undoes the agent's file edits. It does not undo commands it ran, a push, a deployment
> or a message it sent. That is why part 2 exists.

## 6. Steer with acceptance criteria (5 min)

> **Tester focus: you lead this step.** Turn what you found in step 4 into acceptance criteria.

**Type in the chat** (add your own criteria):

```text
Fix the failing priority test without changing the public API.
Acceptance criteria:
- "Gaslucht in de keuken" (Dutch for gas smell) is an emergency.
- Capitals and extra spaces don't matter: "GAS   SMELL near the meter" is an emergency.
- Whole words only: "Brandweer heeft de deur geforceerd" with category lock stays urgent,
  and "Fireplace door is loose" stays normal.
Add a test for each criterion. Do not change the existing tests.
```

Compare with the first run: the number of steps, the files it touched, and whether every criterion is met.
**Which run would you trust in a real repository?**

## 7. Commit (1 min)

**Type in the chat:**

```text
Commit all changes with the message: Part 1: classify Dutch and mixed-case emergencies
```

Approve the commit. From now on the agent commits, but only when you ask.

## Done when

- [ ] The agent reports no failing tests (the 3 backlog tests are still skipped).
- [ ] There is a test for each acceptance criterion.
- [ ] Your work is committed.

## Think about

- Where did the agent surprise you: in what it read, what it skipped, or when it stopped?
- What did the acceptance criteria change?
- Where in this loop would you want a check that the agent cannot skip? (Part 2.)

## Behind?

**Type in the chat:**

```text
Take src and tests from the git tag block-1-solution, run the tests,
and commit with the message: Part 1 from the solution
```

Next: [Part 2: Boundaries](part-2-boundaries.md)
