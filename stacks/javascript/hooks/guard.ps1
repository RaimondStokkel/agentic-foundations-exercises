# Harness guard: a hook that runs before EVERY tool call,
# in Claude Code and in the GitHub Copilot CLI.
# Works in Windows PowerShell 5.1 and PowerShell 7.
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

$rules = @(
    # git push, git.exe push, git -C "my folder" push, git -c key=value push, git 'push'
    @{ Pattern = '\bgit(?:\.exe)?\b[''"]?(?:\s+(?:-C|-c)\s+(?:"[^"]*"|''[^'']*''|\S+)|\s+--?[\w-]+(?:=\S+)?)*\s+[''"]?push\b'
       Reason  = 'Pushing code is a human decision. Ask a person to push.' },
    # .env as a file name, not as part of a longer word
    @{ Pattern = '(^|[\\/\s''"=(])\.env(\.[\w-]+)?\b'
       Reason  = 'Secrets (.env) are off-limits for this agent.' },
    @{ Pattern = 'tenant-export'
       Reason  = 'Tenant data is off-limits for this agent.' }
)

function Deny([string]$reason, [bool]$copilot = $false) {
    $message = "Blocked by harness guard: $reason"
    if ($copilot) {
        [Console]::Out.Write((@{ permissionDecision = 'deny'; permissionDecisionReason = $message } | ConvertTo-Json -Compress))
        exit 0
    }
    [Console]::Error.WriteLine($message)
    exit 2
}

# All string values inside the tool arguments, however deeply nested.
function Get-Strings($value) {
    if ($null -eq $value) { return }
    if ($value -is [string]) { return $value }
    if ($value -is [System.Collections.IEnumerable]) { foreach ($item in $value) { Get-Strings $item }; return }
    foreach ($property in $value.PSObject.Properties) { Get-Strings $property.Value }
}

try {
    $call = [Console]::In.ReadToEnd() | ConvertFrom-Json -ErrorAction Stop
} catch {
    # Fail closed: a guard that cannot read the call must not wave it through.
    Deny 'could not read the tool call.'
}
if ($null -eq $call -or $call -is [string] -or $call -is [ValueType]) { Deny 'could not read the tool call.' }

$names = $call.PSObject.Properties.Name
$copilot = ($names -contains 'toolName') -and -not ($names -contains 'tool_name')
$tool = if ($copilot) { $call.toolName } else { $call.tool_name }
# A brief to a subagent is only text. The subagent's own tool calls pass this guard too.
if (@('Agent', 'Task', 'task') -ccontains $tool) { exit 0 }
$toolArgs = if ($copilot) { $call.toolArgs } else { $call.tool_input }
if ($toolArgs -is [string]) {
    # Copilot may send the arguments as a JSON string.
    try {
        $parsed = $toolArgs | ConvertFrom-Json -ErrorAction Stop
        if ($parsed -isnot [ValueType] -and $parsed -isnot [string]) { $toolArgs = $parsed }
    } catch { }
}
$text = (@(Get-Strings $toolArgs) -join "`n")

foreach ($rule in $rules) {
    if ($text -match $rule.Pattern) { Deny $rule.Reason $copilot }  # -match ignores case
}
exit 0
