// Harness guard: a hook that runs before EVERY tool call,
// in Claude Code and in the GitHub Copilot CLI.
//
// Permission rules match the text of a command ("git push *").
// This hook reads the whole tool call, so it also catches variants such as
// `git -C . push` or a script that opens .env itself.
//
// Input on stdin: the tool call as JSON.
//   Claude Code (and Copilot reading .claude/settings.json): { tool_name, tool_input }
//   Copilot (.github/hooks, event preToolUse):               { toolName, toolArgs }
// Output, to deny the call:
//   Claude Code: exit code 2 with the reason on stderr.
//   Copilot:     a JSON decision on stdout. (Exit code 2 also denies there, but then Copilot only says "hook errored".)
// Exit code 0 with no output lets the normal permission rules decide.
import { readFileSync } from 'node:fs';

const RULES = [
  {
    // git push, git.exe push, git -C "my folder" push, git -c key=value push, git 'push'
    pattern: /\bgit(?:\.exe)?\b['"]?(?:\s+(?:-C|-c)\s+(?:"[^"]*"|'[^']*'|\S+)|\s+--?[\w-]+(?:=\S+)?)*\s+['"]?push\b/i,
    reason: 'Pushing code is a human decision. Ask a person to push.',
  },
  {
    // .env as a file name, not as part of a longer word
    pattern: /(^|[\\/\s'"=(])\.env(\.[\w-]+)?\b/i,
    reason: 'Secrets (.env) are off-limits for this agent.',
  },
  {
    pattern: /tenant-export/i,
    reason: 'Tenant data is off-limits for this agent.',
  },
];

function deny(reason, copilot = false) {
  const message = `Blocked by harness guard: ${reason}`;
  if (copilot) {
    process.stdout.write(JSON.stringify({ permissionDecision: 'deny', permissionDecisionReason: message }));
    process.exit(0);
  }
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

let call;
try {
  call = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  // Fail closed: a guard that cannot read the call must not wave it through.
  deny('could not read the tool call.');
}
if (!call || typeof call !== 'object') deny('could not read the tool call.');

// All string values in the tool arguments, however deeply nested. Copilot may send them as a JSON string.
function strings(value) {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') return strings(parsed);
    } catch {
      // not JSON: a plain string
    }
    return [value];
  }
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

const copilot = 'toolName' in call && !('tool_name' in call);
// A brief to a subagent is only text. The subagent's own tool calls pass this guard too.
if (['Agent', 'Task', 'task'].includes(copilot ? call.toolName : call.tool_name)) process.exit(0);
const text = strings(copilot ? call.toolArgs : call.tool_input).join('\n');
const hit = RULES.find((rule) => rule.pattern.test(text));
if (hit) deny(hit.reason, copilot);
process.exit(0);
