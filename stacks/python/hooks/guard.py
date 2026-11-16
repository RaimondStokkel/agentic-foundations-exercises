# Harness guard: a hook that runs before EVERY tool call,
# in Claude Code and in the GitHub Copilot CLI.
#
# Permission rules match the text of a command ("git push *").
# This hook reads the whole tool call, so it also catches variants such as
# `git -C . push` or a script that opens .env itself.
#
# Input on stdin: the tool call as JSON.
#   Claude Code (and Copilot reading .claude/settings.json): { tool_name, tool_input }
#   Copilot (.github/hooks, event preToolUse):               { toolName, toolArgs }
# Output, to deny the call:
#   Claude Code: exit code 2 with the reason on stderr.
#   Copilot:     a JSON decision on stdout. (Exit code 2 also denies there, but then Copilot only says "hook errored".)
# Exit code 0 with no output lets the normal permission rules decide.
import json
import re
import sys

RULES = [
    # git push, git.exe push, git -C "my folder" push, git -c key=value push, git 'push'
    (re.compile(r"""\bgit(?:\.exe)?\b['"]?(?:\s+(?:-C|-c)\s+(?:"[^"]*"|'[^']*'|\S+)|\s+--?[\w-]+(?:=\S+)?)*\s+['"]?push\b""",
                re.IGNORECASE),
     "Pushing code is a human decision. Ask a person to push."),
    # .env as a file name, not as part of a longer word
    (re.compile(r"""(^|[\\/\s'"=(])\.env(\.[\w-]+)?\b""", re.IGNORECASE),
     "Secrets (.env) are off-limits for this agent."),
    (re.compile(r"tenant-export", re.IGNORECASE),
     "Tenant data is off-limits for this agent."),
]


def deny(reason, copilot=False):
    message = f"Blocked by harness guard: {reason}"
    if copilot:
        sys.stdout.write(json.dumps({"permissionDecision": "deny", "permissionDecisionReason": message}))
        sys.exit(0)
    sys.stderr.write(message + "\n")
    sys.exit(2)


try:
    call = json.loads(sys.stdin.buffer.read().decode("utf-8"))
except Exception:
    # Fail closed: a guard that cannot read the call must not wave it through.
    deny("could not read the tool call.")
if not isinstance(call, dict):
    deny("could not read the tool call.")

def strings(value):
    """All string values in the tool arguments, however deeply nested. Copilot may send them as a JSON string."""
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except ValueError:
            return [value]
        return strings(parsed) if isinstance(parsed, (dict, list)) else [value]
    if isinstance(value, dict):
        return [s for item in value.values() for s in strings(item)]
    if isinstance(value, list):
        return [s for item in value for s in strings(item)]
    return []


copilot = "toolName" in call and "tool_name" not in call
# A brief to a subagent is only text. The subagent's own tool calls pass this guard too.
if (call.get("toolName") if copilot else call.get("tool_name")) in ("Agent", "Task", "task"):
    sys.exit(0)
text = "\n".join(strings(call.get("toolArgs") if copilot else call.get("tool_input")))
for pattern, reason in RULES:
    if pattern.search(text):
        deny(reason, copilot)
sys.exit(0)
