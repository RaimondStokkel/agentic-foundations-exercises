// Runs a guard hook (part 2) against a table of tool calls: what it must deny, and what it must let through.
// Usage, from a stack folder with the hooks/ of block-2-solution: node ../../tools/test-guard.mjs node hooks/guard.mjs
//   (or: python hooks/guard.py, or: powershell -NoProfile -ExecutionPolicy Bypass -File hooks/guard.ps1)
import { spawnSync } from 'node:child_process';

const [cmd, ...cmdArgs] = process.argv.slice(2);
const C = (tool_name, tool_input) => ({ tool_name, tool_input, hook_event_name: 'PreToolUse', cwd: 'C:\\repo' });
const P = (toolName, toolArgs) => ({ sessionId: 's1', timestamp: 1, cwd: 'C:\\repo', toolName, toolArgs });

const cases = [
  ['deny', C('Bash', { command: 'git push origin main' })],
  ['deny', C('Bash', { command: 'git -C . push origin main' })],
  ['deny', C('Bash', { command: 'git -c push.default=current push' })],
  ['deny', C('Bash', { command: "git 'push' origin main" })],
  ['deny', C('PowerShell', { command: 'git push' })],
  ['allow', C('Bash', { command: 'git commit -m "prepare push"' })],
  ['allow', C('Bash', { command: 'git status' })],
  ['deny', C('Read', { file_path: 'C:\\repo\\.env' })],
  ['deny', C('Read', { file_path: '/home/dev/repo/.env.local' })],
  ['deny', C('Bash', { command: `node -e "console.log(require('fs').readFileSync('.env','utf8'))"` })],
  ['deny', C('Write', { file_path: 'show.py', content: "print(open('.env').read())" })],
  ['deny', C('Bash', { command: 'head data/tenant-export.csv' })],
  ['allow', C('Grep', { pattern: 'environment' })],
  ['allow', C('Read', { file_path: 'src/triage.js' })],
  ['allow', C('Bash', { command: 'npm test' })],
  ['allow', C('Bash', { command: 'python -m unittest' })],
  ['deny', P('bash', JSON.stringify({ command: 'cat .env' }))],
  ['deny', P('bash', { command: 'git -C . push' })],
  ['deny', P('view', JSON.stringify({ path: 'C:\\repo\\data\\tenant-export.csv' }))],
  ['allow', P('bash', JSON.stringify({ command: 'dotnet test' }))],
  ['allow', P('view', { path: 'src/Triage.cs' })],
  ['deny', C('Bash', { command: 'git.exe push origin main' })],
  ['deny', C('PowerShell', { command: '& "C:\\Program Files\\Git\\cmd\\git.exe" push' })],
  ['deny', C('Bash', { command: 'git -C "my folder" push origin main' })],
  ['deny', C('Bash', { command: "git -C 'my folder' push" })],
  ['deny', P('bash', JSON.stringify({ command: 'git -C "my folder" push' }))],
  ['allow', C('Bash', { command: 'git -C "my folder" status' })],
  ['allow', C('Agent', { subagent_type: 'test-runner', prompt: 'Run the tests. Never read .env.' })],
  ['allow', C('Task', { subagent_type: 'reviewer', prompt: 'Review src/. Never touch .env or data/.' })],
  ['allow', P('task', JSON.stringify({ agent_type: 'Test Runner', prompt: 'Run the tests. Never read .env.' }))],
  // Not covered by the guard on purpose: web fetches are a permission-rule job (WebFetch deny, --deny-tool 'url').
  ['allow', P('web_fetch', { url: 'https://example.com' })],
  ['deny', 'this is not json'],
  ['deny', ''],
];

let failures = 0;
for (const [expected, input] of cases) {
  const r = spawnSync(cmd, [...cmdArgs], { input: typeof input === 'string' ? input : JSON.stringify(input), encoding: 'utf8' });
  const out = r.stdout.trim();
  let decision = null;
  if (out) { try { decision = JSON.parse(out); } catch { decision = { bad: out }; } }
  const jsonDeny = r.status === 0 && decision?.permissionDecision === 'deny' && /Blocked by harness guard/.test(decision.permissionDecisionReason);
  const actual = r.status === 2 || jsonDeny ? 'deny' : r.status === 0 && !out ? 'allow' : `exit ${r.status} out=${out}`;
  // Copilot-format calls must get the JSON decision (so the agent sees the reason), Claude-format calls exit code 2.
  const copilotCall = typeof input === 'object' && 'toolName' in input;
  const rightChannel = actual !== 'deny' || typeof input === 'string' || (copilotCall ? jsonDeny : r.status === 2 && /Blocked by harness guard/.test(r.stderr));
  const ok = actual === expected && rightChannel;
  if (!ok) failures++;
  const label = typeof input === 'string' ? JSON.stringify(input) : JSON.stringify(input.tool_input ?? input.toolArgs);
  console.log(`${ok ? 'PASS' : 'FAIL'}  expected ${expected.padEnd(5)} got ${actual.padEnd(6)} ${label.slice(0, 80)}${ok ? '' : '  stderr: ' + r.stderr.trim()}`);
}
console.log(failures ? `\n${failures} of ${cases.length} cases failed` : `\nall ${cases.length} cases passed`);
process.exit(failures ? 1 : 0);
