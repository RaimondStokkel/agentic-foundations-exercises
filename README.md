# Agentic Foundations: exercises

Hands-on exercises for the Zig Grow session **Agentic Foundations** (AI capabilities, Track 1).
You work through them by **chatting with your agent**: you type what the steps say and approve what the agent asks.
You don't need to write code. Each part builds on the one before.

The exercises work with **Claude** (the Code tab of the Claude desktop app) and with **GitHub Copilot** (VS Code's
Agents window, or the Copilot CLI). They are for **developers in any stack** and for **testers**.

> **All data in this repo is synthetic.** Each stack has a `.env` with a fake key and a `data/tenant-export.csv`
> with made-up tenants. They are there on purpose, so the agent's boundaries have something to protect.
> Treat them *as if* they were real secrets and real tenant data. Never use real customer data in these exercises.

## The parts

| Part | You learn | Time |
|---|---|---|
| [0. Set up](exercises/part-0-setup.md) | Get the code and open it in your agent. Best done before the session | 10 min |
| [1. The loop](exercises/part-1-the-loop.md) | The loop inside the agent: how it thinks, acts and observes; steering it with acceptance criteria; undoing its work | 22 min |
| [2. Boundaries](exercises/part-2-boundaries.md) | What the agent may do alone, must ask for, or may never do; permission rules and a guard hook | 25 min |
| [3. Context](exercises/part-3-context.md) | What a long file does to the context window; searching instead of reading; memory in a file | 12 min |
| [4. Subagents](exercises/part-4-subagents.md) | Helpers with their own context and only the tools they need | 20 min |
| [5. The loop on its own](exercises/part-5-the-loop-on-its-own.md) | A second loop, around the agent: a fresh context per round, tests as the judge and commits as checkpoints | 18 min |

**In the session** (Teams): everyone works alone, on their own laptop. The trainer explains a topic with a few
slides, then you do the next part in your agent, following its file. Thumbs-up in Teams when you are done; raise your
hand when you are stuck. [Part 0](exercises/part-0-setup.md) explains how it works.

## Your agent

| Agent | Where |
|---|---|
| Claude | The **Code** tab of the Claude desktop app, a local session on your computer |
| GitHub Copilot, Agents window | VS Code: **Open in Agents** in the title bar, then a session on **This Computer** with the **Agent** |
| GitHub Copilot CLI | `copilot` in a terminal |

All need a licence. **No licence?** Tell the trainer before the session.

## Developers and testers

Developers and testers do every step of the same parts. Some steps have a note for one of them:

- **Developer focus:** the rules, the helpers and how the agent got there.
- **Tester focus:** what "done" means, what could go wrong, and proof that the boundaries hold.

## Your stack

| Folder | Needs | Test command |
|---|---|---|
| [`stacks/javascript`](stacks/javascript) | Node.js 20+ | `npm test` |
| [`stacks/python`](stacks/python) | Python 3.10+ | `python -m unittest` |
| [`stacks/csharp`](stacks/csharp) | .NET SDK 8+ | `dotnet test` |
| [`stacks/java`](stacks/java) | JDK 11+ (no Maven or Gradle) | `java RunTests.java` |

Every stack has the same small service, the same tests and the same bug. **Business Central (AL), Go, PHP or another
stack?** Pick the folder you read most easily. The exercises are about the agent, not the language. Doing this with a
real repository is the next session (5 Jan).

## Solutions

The reference solutions are git tags. Parts 1, 2, 4 and 5 end with a "Stuck or behind?" step that takes over the solution through your agent.

| Part | Tag |
|---|---|
| 1 | `block-1-solution` |
| 2 | `block-2-solution` |
| 4 and 5 | `block-3-solution` |

Each tag holds the solution for every stack and both agents.

## Safety

- Part 2 asks the agent to push. It pushes to `sandbox`, a fake remote that points to a folder that doesn't exist, so a
  push fails even if your harness lets it through. You also have no write access to this repository.
- Do these exercises in this repository only. Do not give the agent access to real secrets or real customer data.

## How the exercises were tested

In November 2026 the exercises were run with real agents on Windows, in Claude Code 2.1 (CLI) and the Copilot CLI 1.0:

- **The loop:** both agents fixed the failing test in about 30 seconds, in different stacks.
- **Boundaries:** the guard hook blocked the requests H4, H5, H7, H8 and H9 in both agents.
- **Subagents and the loop on its own:** both agents delegated to the test-runner and the reviewer, and the loop script
  finished the backlog in 3 rounds with Claude Code (Python and Java) and with Copilot (C# and Python).

On 17 November the chat prompts of every part were run as written, with Claude Code (Python stack) and, for parts 2
and 4, the Copilot CLI (JavaScript stack). The guard blocked H4, H7 and H9 in both. Two prompts needed clearer wording:
Copilot wrote its agents to the repository root, and a fresh session in part 3 read the log again instead of only the
notes. Those prompts are fixed but were not run again. Copilot CLI 1.0.112 loads the stack folder's hook and agents
when you start it in the stack folder.

All four stacks pass their tests at every solution tag. The guard hook passes the same 33 cases in Node.js, Python,
Windows PowerShell 5.1 and PowerShell 7 (`tools/test-guard.mjs`). The loop script passes 8 scenarios with a stub agent
(`tools/test-ralph.sh`), without calling a model.

**Not tested:** the Claude desktop app and Copilot's Agents window. Their steps follow the vendors' documentation, and
both read the same rule, hook and agent files as the tested CLIs. Also not tested: macOS and Linux.

## What is in this repo

```text
exercises/          the six parts
stacks/<stack>/     one folder per stack, each a complete little project:
  src/              the triage service (the code the agent works on)
  tests/            the tests (part 5's backlog is in here, switched off)
  .env, data/       fake secrets and synthetic tenant data, for the agent to stay away from
  logs/             a long, noisy, synthetic pipeline log, for part 3
tools/ralph.sh      the loop as a script (part 5, extra)
tools/test-*.*      self-tests for the guard hook and the loop script
```
