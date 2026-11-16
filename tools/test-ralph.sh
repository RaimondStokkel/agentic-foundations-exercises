#!/usr/bin/env bash
# Self-test for tools/ralph.sh with a stub "claude" agent: no model calls, about a minute.
# Each scenario builds a tiny Python "stack" (3 tests that check whether src/a, src/b, src/c exist)
# and a stub agent that does a scripted action per iteration.
# Usage, from the repo root: bash tools/test-ralph.sh
set -u
RALPH=$(cd "$(dirname "$0")" && pwd)/ralph.sh
WORK=$(mktemp -d)
STUBDIR="$WORK/bin"; mkdir -p "$STUBDIR"
cat > "$STUBDIR/claude" <<'EOF'
#!/usr/bin/env bash
# Stub agent: one scripted action per call, taken from $STUB_SCRIPT (one line per iteration).
n=$(( $(cat "$STUB_COUNT" 2>/dev/null || echo 0) + 1 )); echo "$n" > "$STUB_COUNT"
action=$(sed -n "${n}p" "$STUB_SCRIPT")
for step in $action; do
  case "$step" in
    fix:*)   touch "src/${step#fix:}" ;;
    tick:*)  sed -i "${step#tick:}s/^- \[ \]/- [x]/" ralph/fix_plan.md ;;
    hook)    echo "tampered" > hooks/guard.sh ;;
    test)    echo "# weakened" >> tests/test_triage.py ;;
    nothing) : ;;
  esac
done
EOF
chmod +x "$STUBDIR/claude"

pass=0; fail=0
scenario() { # name, max, expected-exit, stub-script lines..., [precheck]
  local name=$1 max=$2 want=$3; shift 3
  local dir="$WORK/$name"; mkdir -p "$dir/src" "$dir/tests" "$dir/ralph" "$dir/hooks"; cd "$dir"
  git init -q -b main; git config user.email t@example.invalid; git config user.name t
  : > src/__init__.py; : > tests/__init__.py; echo "guard v1" > hooks/guard.sh
  cat > tests/test_triage.py <<'PY'
import os, unittest
class T(unittest.TestCase):
    def test_a(self): self.assertTrue(os.path.exists("src/a"))
    def test_b(self): self.assertTrue(os.path.exists("src/b"))
    def test_c(self): self.assertTrue(os.path.exists("src/c"))
PY
  printf '# Fix plan\n\n- [ ] a\n- [ ] b\n- [ ] c\n\n## Notes for the next iteration\n' > ralph/fix_plan.md
  [ "${PRECHECK:-}" = 1 ] && sed -i 's/^- \[ \]/- [x]/' ralph/fix_plan.md
  echo "prompt" > ralph/PROMPT.md
  printf '**/ralph/log-*.txt\n' > .gitignore
  git add -A; git commit -qm start
  printf '%s\n' "$@" > "$WORK/$name.script"; rm -f "$WORK/$name.count"
  STUB_SCRIPT="$WORK/$name.script" STUB_COUNT="$WORK/$name.count" PATH="$STUBDIR:$PATH" \
    bash "$RALPH" "$max" claude > "$WORK/$name.out" 2>&1
  local got=$?
  if [ "$got" = "$want" ]; then pass=$((pass + 1)); echo "PASS  $name (exit $got)"
  else fail=$((fail + 1)); echo "FAIL  $name: expected exit $want, got $got"; sed 's/^/        /' "$WORK/$name.out"; fi
  cd "$WORK"
}

# 1. Every item done, the last one on the final allowed iteration: success.
scenario finish-on-last-iteration 3 0 "fix:a tick:3" "fix:b tick:4" "fix:c tick:5"
# 2. The agent fixes the code but forgets to tick; the next iteration only ticks. Both are progress.
scenario fix-then-tick 4 0 "fix:a" "tick:3" "fix:b tick:4" "fix:c tick:5"
# 3. Plan already ticked off but the tests fail: not a success.
PRECHECK=1 scenario ticked-but-failing 3 1 "nothing"
# 4. The agent edits the harness (a hook) along with real progress: rolled back, then it behaves.
scenario harness-edit-rolled-back 4 0 "hook fix:a tick:3" "fix:a tick:3" "fix:b tick:4" "fix:c tick:5"
# 5. The agent weakens a test: rolled back, never committed; cap reached.
scenario test-edit-rolled-back 2 1 "test fix:a tick:3" "test fix:a tick:3"
# 6. No progress at all: rolled back each time; cap reached.
scenario no-progress 2 1 "nothing" "nothing"

# Extra checks on the scenario repos.
grep -q "guard v1" "$WORK/harness-edit-rolled-back/hooks/guard.sh" && ! git -C "$WORK/harness-edit-rolled-back" log -p | grep -q "^+tampered$" \
  && { pass=$((pass + 1)); echo "PASS  harness file never committed"; } || { fail=$((fail + 1)); echo "FAIL  harness file changed in history"; }
[ "$(git -C "$WORK/test-edit-rolled-back" log --oneline | wc -l)" -eq 1 ] \
  && { pass=$((pass + 1)); echo "PASS  weakened test never committed"; } || { fail=$((fail + 1)); echo "FAIL  a weakened test was committed"; }

echo; echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
