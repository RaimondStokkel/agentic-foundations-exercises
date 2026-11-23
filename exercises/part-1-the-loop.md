# Part 1: The loop

**20 minutes.** You watch the agent think, act and observe. Then you steer it with acceptance criteria and undo its
work with a checkpoint.

| | |
|---|---|
| You start with | Part 0 done: a session in your stack folder, 1 failing test |
| You end with | The failing test fixed, a test for each of your acceptance criteria, committed |

A new session for this part? Start it in your stack folder, as in [part 0](part-0-setup.md#how-to-start-a-new-session), never in
`agentic-foundations-exercises`. GitHub Copilot App: before you type, check the bar under the prompt box: your stack folder, **This computer**, **Current checkout** (not **New worktree**).

An agent is a model in a loop. Every turn it **thinks** (what do I know, what next?), **acts** (asks for one tool:
read a file, run the tests, edit a file) and **observes** (reads what came back). It stops when it answers without
asking for a tool.

This is the loop **inside** the agent. Part 5 puts a second loop **around** it.

## 1. Make the agent ask first (1 min)

| Agent | How |
|---|---|
| Claude desktop app | In the mode selector under the prompt box, choose **Manual** |
| GitHub Copilot App | Click the mode menu under the prompt, point to **Tool permissions** and choose **Always ask**. Keep the mode on **Interactive**. To keep this for every new session, also set **Settings** > **Sessions** > **Tool permissions** to **Always ask** |
| Copilot CLI | Nothing to do: it asks before it runs a command or changes a file |

## 2. Predict (3 min)

Before you start the agent, answer these for yourself:

- What will the agent do first?
- How many steps (tool calls) will it need?
- Which files will it change?

> **Tester focus:** also write down what could go wrong. Two classics: the agent changes the *test* instead of the
> code, or the fix passes the test but breaks something nobody tested.

## 3. Watch one loop (4 min)

**Type in your agent:**

```text
Fix the failing priority test without changing the public API.
```

Before you approve a step, say what you expect it to return. Keep a short tally like this one:

| # | Thought: why this step? | Action: which tool, on what? | Observation: what came back? |
|---|---|---|---|
| 1 | | | |

The text the agent writes between its steps is the "thought". Every tool call it shows you is an "action".
The GitHub Copilot App folds the actions into grey lines, such as "Run Python tests ... and 1 other tool call". Click
the arrow in front of a line to see each action and what came back.
Some agents write nothing before a tool call. Then fill in the first column yourself: what do you expect this step
to tell you?

When it is done, compare with your prediction. **How many steps did it take? Which observation changed its plan?**

Your agent's steps will differ from a colleague's, and from a second run: the path is not deterministic. The result
is what you can test, and that is what steps 4 and 6 do.

## 4. Check the result (4 min)

**Type in your agent:**

```text
Which files did you change? Then, without changing any files, classify these three requests
and tell me the priority of each:
1. "GAS   SMELL near the meter", category heating
2. "Brandweer heeft de deur geforceerd" (Dutch: the fire brigade forced the door), category lock
3. "Fireplace door is loose", no category
```

**The right answers:** 1 is an emergency (capitals and extra spaces don't matter). 2 is urgent: a lock is urgent,
and "Brandweer" is not a fire, even if your agent added "brand" (fire) as a keyword. 3 is normal: "fire" is only
part of "Fireplace".

When we tested this, both Claude Code and Copilot fixed the failing test in about 30 seconds. Both fixes still made
"Fireplace door is loose" an emergency, and missed "GAS   SMELL" with the extra spaces. The test passed, but the
requirement was not met.

Compare your three results with the right answers. Did one differ? Write that example down: it is something the
passing test missed. Were all three right? Then your agent found a more complete fix at its first try. Go on with
step 5 either way: you practise undoing an edit, and in step 6 you turn the examples into tests that catch the
mistake if it ever comes back.

> **Tester focus:** did the agent change anything in `tests/`? A test that passes because its expectation was changed
> proves nothing. Then pick one wrong answer above and decide: is this a bug, or a requirement nobody wrote down?

## 5. Undo the incomplete fix (3 min)

A first fix that passes the test can still miss the requirement. Take yours back with a **checkpoint**, so step 6
starts clean from the full specification:

| Agent | How |
|---|---|
| Claude desktop app | Type `/rewind`. Pick the point before your task and choose **Restore code and conversation**. No `/rewind` in your app? Type: `Undo all changes in src and tests with git restore and git clean.` Then start a new session in your stack folder (**+ New**) and choose **Manual** again |
| GitHub Copilot App | The app has no rewind. Type: `Undo all changes in src and tests with git restore and git clean.` Then start a new session ([how](part-0-setup.md#how-to-start-a-new-session)). Before you type, check the bar under the prompt box: your stack folder, **This computer**, **Current checkout** (not **New worktree**) |
| Copilot CLI | Type `/rewind`. Pick your task prompt: Copilot goes back to just before it. Choose **Conversation + files** |

**Type in your agent:** `Run the tests.` You should be back to 1 failing test, in your stack only. Tests of more than
one stack mean the new session is in the wrong folder: see "Stuck or behind?" below.

Why a new session after a git undo? Git puts the files back, but the conversation still holds the first fix. A new
session makes step 6 start as fresh as step 3, so you can compare the two runs.

> **Good to know:** a checkpoint undoes the agent's file edits. It does not undo commands it ran, a push, a deployment
> or a message it sent. That is why part 2 exists.

## 6. Steer with acceptance criteria (4 min)

> **Tester focus:** turning findings into acceptance criteria is your craft, so be strict. Everyone writes them here,
> from what you found in step 4.

**Type in your agent** (add your own criteria):

```text
Fix the failing priority test without changing the public API.
Acceptance criteria:
- "Gaslucht in de keuken" (Dutch for gas smell) is an emergency.
- Capitals and extra spaces don't matter: "GAS   SMELL near the meter" is an emergency.
- Whole words only: "Brandweer heeft de deur geforceerd" with category lock stays urgent,
  and "Fireplace door is loose" stays normal.
Add a test for each criterion. Do not change the existing tests.
```

**You should see:** no failing tests (the 3 backlog tests are still skipped), at least one new test per criterion,
and no change to the existing tests.

Compare with the first run: the files it touched, and whether every criterion is met. The number of steps is not the
point: the second run often takes more, because it writes tests. **Which run would you trust in a real repository?**

## 7. Commit (1 min)

**Type in your agent:**

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

## Stuck or behind?

Stuck: raise your hand in Teams, or post in the Teams chat.

**The agent names or changes other stacks?** Then the session runs in the wrong folder. Start a new session in your
stack folder, as in [part 0](part-0-setup.md#how-to-start-a-new-session). Did it change files there? **Type in the new session:**
`Undo every change outside this folder with git restore and git clean.`

Out of time? **Type in your agent:**

```text
Take src and tests from the git tag block-1-solution, run the tests,
and commit with the message: Part 1 from the solution
```

Next: [Part 2: Boundaries](part-2-boundaries.md)
