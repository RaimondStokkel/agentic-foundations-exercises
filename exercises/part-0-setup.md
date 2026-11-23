# Part 0: Set up

**15 minutes. Best done before the session.** You put the exercise code on your computer and open it in your agent.
From here on you only type in your agent and approve what it asks.

## How the session works

- You join the Teams meeting and work on your own laptop. The trainer explains a topic with a few slides, then
  everyone does the next part on their own.
- Open each part's file in your browser, on GitHub. It has every step, so you don't need the shared screen while you
  work. Make the Teams window small, or put it on a second screen.
- **"Type in your agent"** means the chat of Claude or Copilot. **"The Teams chat"** means the meeting chat.
- Done with a part: a thumbs-up reaction in Teams. Stuck: raise your hand, or post in the Teams chat. The trainer may
  ask you to share your screen.

## What you need

- **One agent, with a licence:**
  - **Claude:** the Claude desktop app, **Code** tab (a Pro, Max, Team or Enterprise plan)
  - **GitHub Copilot App:** the app from the Microsoft Store
  - **GitHub Copilot CLI:** `copilot` in a terminal
- **Git**
- **One of these:** Node.js 20+, Python 3.10+, .NET SDK 8+ or JDK 11+. Not sure what you have? Don't worry. The agent checks it
  for you in step 2.

No licence? Tell the trainer before the session: without one you can only follow along in the Teams chat.

## 1. Open an empty folder in your agent (3 min)

Make an empty folder, for example `Documents\agentic`. Open it in your agent:

| Agent | How |
|---|---|
| Claude desktop app | Open the **Code** tab. Under the prompt box, choose **Local**, then click the folder control and choose **Open folder…** |
| GitHub Copilot App | Click **+** next to **Sessions**. Under **Start session in**, choose **Open local folder** and your folder. Under the prompt box, keep **This computer** |
| Copilot CLI | In a terminal, go to the folder (`cd Documents\agentic`) and type `copilot` |

If the agent asks whether you trust the folder, say yes.

## 2. Let the agent fetch the code (4 min)

**Type in your agent:**

```text
Clone https://github.com/RaimondStokkel/agentic-foundations-exercises.git into a new folder named
agentic-foundations-exercises inside the folder I opened. Create a branch called my-harness in the clone.
Then check which of these are installed and tell me their versions: git, node, python, dotnet, java.
```

Your agent may ask before it runs a command: read each command, then approve it. Claude can start in **Auto** mode
and then asks less. In part 1 you switch it to **Manual**.

Now pick your **stack**: the language you read most easily, out of what is installed. You don't need to be a
developer: the exercises are about the agent, not the code.

| Installed | Your stack folder |
|---|---|
| node | `stacks\javascript` |
| python | `stacks\python` |
| dotnet | `stacks\csharp` |
| java | `stacks\java` |

**Type in your agent**, with your own stack:

```text
I chose Python. Print the full path of the stack folder I should open in my next session.
```

**Write that path down.** Every "new session" in the later parts starts in exactly this folder. Never start one in
`agentic-foundations-exercises`, the folder above it: that folder holds all four stacks, and an agent started there
may work on all four.

## 3. Open your stack folder (3 min)

From now on, **your stack folder is the project**. The agent reads its rules and helpers from the folder you open, so
always open the stack folder, not the folder above it.

Start a new session in `agentic-foundations-exercises\stacks\<your stack>`, the path you wrote down:

| Agent | How |
|---|---|
| Claude desktop app | Click **+ New** (or press Ctrl+N). Choose **Local**, then **Open folder…** and your stack folder |
| GitHub Copilot App | Click **+** next to **Sessions**. Under **Start session in**, choose **Open local folder** and pick the stack folder itself, not `agentic-foundations-exercises`. Under the prompt box, keep **This computer**, and under **Workspace** choose **Current checkout** |
| Copilot CLI | Type `/exit`. Then `cd agentic-foundations-exercises\stacks\python` (your stack) and `copilot` |

**GitHub Copilot App: check before you type.** Every new session starts with the app's defaults: a **New worktree**
(a clean copy without your work, your rules or your hook) and **Assisted** (the app approves requests by itself).
Neither is what you want here.

- **Once, now:** open **Settings** > **Sessions** > **Tool permissions** and choose **Always ask**.
- **Every new session, before you type:** under **Start session in**, your stack folder (never
  `agentic-foundations-exercises`; not in the list? **Open local folder** and pick it again). Under the prompt box,
  **This computer** and **Current checkout**. In the mode menu, **Tool permissions** is **Always ask**.
- If the app asks whether you trust the repository, trust it.

**Type in your agent:**

```text
Run the tests as README.md describes and tell me how many pass, fail and are skipped.
```

**You should see:** 9 tests. 5 pass, 1 fails (a Dutch gas smell is not seen as an emergency) and 3 are skipped
(the backlog for part 5). The failing test is there on purpose: seeing it fail means your setup works.

**Check the folder.** The answer is about your stack only. Does the agent run the tests of more than one stack, or
ask which stack you mean? Then the session runs in the wrong folder: start a new one in your stack folder. The same
goes for every later part: an agent that names or changes another stack is in the wrong folder.

## Done when

- [ ] Your agent has a session open in your stack folder.
- [ ] The agent reports 5 passed, 1 failed, 3 skipped.

## Stuck?

- **The clone fails:** check that Git is installed (`git --version` in a terminal), or raise your hand in Teams.
- **None of Node.js, Python, .NET or Java is installed:** install Python or Node.js before the session (ask IT if you can't).
- **The tests don't run:** type `Why do the tests not run? Explain it in simple words.` The agent is good at this.
- **The agent names or changes other stacks:** the session runs in the wrong folder. Start a new session in the stack
  folder you wrote down. GitHub Copilot App: pick your stack folder under **Start session in**, not
  `agentic-foundations-exercises`.

Next: [Part 1: The loop](part-1-the-loop.md)
