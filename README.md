# Agentic Foundations: exercises

Three blocks of hands-on exercises for the Zig Grow session **Agentic Foundations** (AI capabilities, Track 1).
Each block builds on the one before. First you watch the agent loop and steer it. Then you put a harness
around it. Then you let it delegate and loop on its own, safely, because of the harness you built.

The exercises work with **Claude Code** and with **GitHub Copilot**: agent mode in VS Code's Agents window, or the Copilot CLI.
They are for **developers in any stack** and for **testers**.

> **All data in this repo is synthetic.** Each stack has a `.env` with a fake key and a `data/tenant-export.csv`
> with made-up tenants. They are there on purpose, so the agent's boundaries have something to protect.
> Treat them *as if* they were real secrets and real tenant data. Never use real customer data in these exercises.

## The three blocks

| Block | You learn | You build | Time |
|---|---|---|---|
| [1. The loop](exercises/block-1-the-loop.md) | How an agent thinks, acts and observes; steering it with acceptance criteria; undoing it with a checkpoint; what a long log does to its context | The bug fix, with tests for your acceptance criteria | 40 min |
| [2. The harness](exercises/block-2-the-harness.md) | Permission rules (allow, ask, deny), hooks, protecting the tests | Permission rules and a guard hook, proven by a harness test plan | 45 min |
| [3. Delegation and loops](exercises/block-3-delegation-and-loops.md) | Subagents with their own context and tools; a Ralph loop with tests as the judge and git commits as checkpoints | A test-runner and a reviewer subagent, and an unattended loop that works through the backlog | 50 min |

You need the result of block 1 for block 2, and the harness from block 2 for block 3.

## Before you start

### 1. Pick your tool

| | Claude Code | GitHub Copilot |
|---|---|---|
| Where | The terminal (`claude`) or the Claude Code extension for VS Code | **Agent mode** in VS Code's **Agents window**, or the **Copilot CLI** (`copilot`) in a terminal. Both read the same agent and hook files |
| Tested with | Claude Code 2.1 | Copilot CLI 1.0.105 and 1.0.112. The Agents window steps follow the VS Code documentation |

Both need a licence. **No licence?** Do the parts you can do on paper: the predictions, acceptance criteria and
test plans, and the configuration files. Then compare them with the solutions.

### 2. Pick your stack

| Folder | You need | Test command |
|---|---|---|
| [`stacks/javascript`](stacks/javascript) | Node.js 20+ | `npm test` |
| [`stacks/python`](stacks/python) | Python 3.10+ | `python -m unittest` |
| [`stacks/csharp`](stacks/csharp) | .NET SDK 8+ | `dotnet test` |
| [`stacks/java`](stacks/java) | JDK 11+ (no Maven or Gradle) | `java RunTests.java` |

Every stack has the same small service, the same tests and the same bug. **Business Central (AL), Go, PHP or another
stack?** Pick the folder you read most easily. The exercises are about the harness, not the language, and everything
transfers to your own repository. Doing that with a real repo is the next session (5 Jan).

You also need Git. For block 3 you need bash, which comes with Git for Windows as **Git Bash**.

### 3. Pick your role

Developers and testers do the same blocks. Each block marks the steps where one of them leads:

- **Developer focus**: the configuration, the code and how the agent got there.
- **Tester focus**: what "done" means, what could go wrong, and proof that the boundaries hold.

Best of all: work in pairs, one developer and one tester on one screen.

### 4. Set up (5 minutes)

```bash
git clone https://github.com/RaimondStokkel/agentic-foundations-exercises.git
cd agentic-foundations-exercises
git switch -c my-harness
cd stacks/python
python -m unittest
```

Use your own stack folder and test command. Expect **9 tests: 5 pass, 1 fails, 3 are skipped.**

Then open **your stack folder**, not the repo root, as the project:

- **Claude Code:** run `claude` in the stack folder and say yes when it asks whether you trust the folder.
  Until you trust it, Claude Code ignores the folder's *allow* rules, and you need those in block 2.
- **Copilot, agent mode:** in VS Code, click **Open in Agents** in the title bar (or run `code --agents`). Start a
  **New Session**, choose **This Computer**, open your stack folder, keep the **Copilot** target and pick **Agent**.
  Trust the folder when VS Code asks: in a folder you don't trust, agents are switched off.
- **Copilot CLI:** run `copilot` in the stack folder and trust the folder when it asks.

## Solutions

Every block has a reference solution as a git tag: `block-1-solution`, `block-2-solution` and `block-3-solution`.
Each tag holds the solution for every stack and both tools. From your stack folder:

```bash
git diff HEAD block-2-solution -- .        # compare your work with the solution
git checkout block-2-solution -- hooks     # take one folder from the solution
```

Using a solution is fine. Compare first, though: the differences are the lesson.

## Safety

- Block 2 asks the agent to push. It pushes to `sandbox`, a fake remote that points to a folder that doesn't exist,
  so a push fails even if your harness lets it through. You also have no write access to this repository.
- Run these exercises in this repository only. Do not give the agent access to real secrets or real customer data.
- The Ralph loop in block 3 runs the agent without asking you. Run it only on your exercise branch.

## How the exercises were tested

In November 2026 every block was run with real agents on Windows, in Claude Code 2.1 and the Copilot CLI 1.0:

- **Block 1:** both agents fixed the failing test in about 30 seconds, in different stacks.
- **Block 2:** the guard hook blocked every attack case in both tools.
- **Block 3:** both tools delegated to the test-runner and reviewer subagents, and the Ralph loop finished the backlog
  in 3 iterations with Claude Code (Python and Java) and with Copilot (C#).

All four stacks pass their tests at every solution tag. The guard hook passes the same 33 cases in Node.js, Python,
Windows PowerShell 5.1 and PowerShell 7 (`tools/test-guard.mjs`); block 2 lists what it does and doesn't cover. The loop
script passes 8 scenarios with a stub agent (`tools/test-ralph.sh`), without calling a model.

**Not tested:** Copilot agent mode in VS Code's Agents window (its steps follow the VS Code documentation, and it reads
the same agent and hook files as the tested Copilot CLI), and macOS and Linux.

## What is in this repo

```text
exercises/          the three blocks
stacks/<stack>/     one folder per stack, each a complete little project:
  src/              the triage service (the code the agent works on)
  tests/            the tests (block 3's backlog is in here, switched off)
  .env, data/       fake secrets and synthetic tenant data, for the agent to stay away from
  logs/             a long, noisy, synthetic pipeline log, for the context exercise
tools/ralph.sh      the loop script for block 3
tools/test-*.*      self-tests for the guard hook and the loop script
```
