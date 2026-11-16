#!/usr/bin/env bash
# Ralph loop (block 3): one fresh, non-interactive agent run per plan item.
#
# The script (the harness), not the model, decides what counts as progress:
#   fewer failing tests AND the tests left untouched -> commit a checkpoint,
#   anything else                                    -> roll back to the last checkpoint.
#
# Run it from your stack folder, in bash (on Windows: Git Bash):
#   bash ../../tools/ralph.sh [max-iterations] [claude|copilot] [extra agent flags...]
#   bash ../../tools/ralph.sh 5 copilot
#   bash ../../tools/ralph.sh 5 claude --model sonnet
#
# It needs ralph/PROMPT.md and ralph/fix_plan.md in your stack folder (block 3 shows how).
# A rollback throws away uncommitted changes in src/, tests/ and ralph/, so it refuses
# to start with uncommitted changes. Use a branch you can throw away.
set -u
max=${1:-5}
agent=${2:-claude}
shift 2 2>/dev/null || shift $#
extra=("$@")

# Which stack is this, and how do we count failing tests?
if [ -f package.json ]; then
  TEST_CMD="npm test"
  fails() { local n; n=$(npm test 2>&1 | sed -n 's/^ℹ fail //p'); echo "${n:-99}"; }
elif [ -f Triage.csproj ]; then
  TEST_CMD="dotnet test"
  fails() { local n; n=$(dotnet test 2>&1 | sed -n 's/.*Failed: *\([0-9][0-9]*\),.*/\1/p' | head -1); echo "${n:-99}"; }
elif [ -f RunTests.java ]; then
  TEST_CMD="java RunTests.java"
  fails() { local n; n=$(java RunTests.java 2>&1 | sed -n 's/^fail //p'); echo "${n:-99}"; }
elif [ -f tests/test_triage.py ]; then
  PY=$(command -v python || command -v python3 || command -v py)
  TEST_CMD="$(basename "$PY" .exe) -m unittest"
  fails() {
    local out; out=$("$PY" -m unittest 2>&1)
    # No "Ran N tests" line means the tests did not run at all: count that as the worst case.
    grep -q '^Ran [0-9]* test' <<<"$out" || { echo 99; return; }
    grep -oE '(failures|errors)=[0-9]+' <<<"$out" | awk -F= '{ s += $2 } END { print s + 0 }'
  }
else
  echo "Run this from a stack folder, for example stacks/python." >&2
  exit 2
fi

for f in ralph/PROMPT.md ralph/fix_plan.md; do
  [ -f "$f" ] || { echo "Missing $f. Block 3, step 3 shows how to write it." >&2; exit 2; }
done
if [ -n "$(git status --porcelain -- .)" ]; then
  echo "Commit your changes first: a rollback would throw them away." >&2
  exit 2
fi

run_agent() {
  # A short one-line prompt: on Windows, Copilot cannot take a multi-line prompt on the command line.
  local prompt="Read ralph/PROMPT.md and follow its instructions exactly. You have no memory of earlier iterations."
  case "$agent" in
    claude)
      # Edits are accepted; anything your settings.json does not allow is refused (nobody is there to ask).
      claude -p "$prompt" --permission-mode acceptEdits --max-turns 25 ${extra[@]+"${extra[@]}"} ;;
    copilot)
      # --trust-folder loads the repo's hooks; allow and deny rules are flags (Copilot CLI has no repo file for them).
      # The test runner is allowed by its first word ("shell(dotnet:*)"), because Copilot often pipes the test output.
      copilot -p "$prompt" --trust-folder --no-ask-user -s \
        --allow-tool write --allow-tool "shell(${TEST_CMD%% *}:*)" \
        --deny-tool 'shell(git push)' --deny-tool 'shell(git commit)' ${extra[@]+"${extra[@]}"} ;;
    *)
      echo "Unknown agent '$agent': use claude or copilot." >&2; exit 2 ;;
  esac
}

rollback() {
  git restore --source=HEAD --staged --worktree -- . && git clean -qfd -- src tests ralph
}

before=$(fails)
echo "Start: $before failing tests ($TEST_CMD), agent: $agent"
for i in $(seq 1 "$max"); do
  if ! grep -q '^- \[ \]' ralph/fix_plan.md; then
    echo "Plan done after $((i - 1)) iterations. Failing tests: $before"
    exit 0
  fi
  echo "--- iteration $i (failing tests: $before)"
  # Fresh context every iteration: the run knows only the prompt and the files.
  run_agent > "ralph/log-$i.txt" 2>&1
  after=$(fails)
  if [ -n "$(git status --porcelain -- tests)" ]; then
    echo "the agent changed tests/: rolling back to the last checkpoint"
    rollback
  # shortcut: compares failure counts only, so fixing two tests while breaking one still counts as progress; compare test names if that bites.
  elif [ "$after" -lt "$before" ]; then
    git add -A -- . && git commit -qm "ralph: iteration $i ($before -> $after failing tests)"
    echo "checkpoint $(git rev-parse --short HEAD): $before -> $after failing tests"
    before=$after
  else
    echo "no progress ($before -> $after failing tests): rolling back to the last checkpoint"
    rollback
  fi
done
echo "Stopped at the iteration cap ($max). Failing tests: $before"
exit 1
