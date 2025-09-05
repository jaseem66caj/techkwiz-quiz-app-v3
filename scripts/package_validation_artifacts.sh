#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/jaseem/Documents/GitHub/Techkwiz-v8"
cd "$ROOT_DIR"

TS=$(date '+%Y%m%d-%H%M%S')
OUT_DIR="techkwiz-v8-production-validation-$TS"
mkdir -p "$OUT_DIR/server-stability" "$OUT_DIR/e2e-test-results" "$OUT_DIR/performance-baseline" "$OUT_DIR/production-readiness"

# Server stability artifacts
[ -f logs/stability-monitor.log ] && cp logs/stability-monitor.log "$OUT_DIR/server-stability/" || true
(pm2 status || true) > "$OUT_DIR/server-stability/pm2-status-output.txt" 2>&1 || true
(pm2 logs --lines 200 || true) > "$OUT_DIR/server-stability/pm2-logs-excerpt.txt" 2>&1 || true

# E2E test artifacts
[ -d playwright-report ] && cp -R playwright-report "$OUT_DIR/e2e-test-results/" || true
[ -d test-results ] && cp -R test-results "$OUT_DIR/e2e-test-results/" || true
[ -f test-results.json ] && cp test-results.json "$OUT_DIR/e2e-test-results/" || true
[ -f logs/e2e_execution_*.log ] && cp logs/e2e_execution_*.log "$OUT_DIR/e2e-test-results/execution-log.txt" 2>/dev/null || true

# Performance artifacts
[ -d performance-results ] && cp -R performance-results "$OUT_DIR/performance-baseline/" || true
ls -1 performance-results/*performance_report_* 2>/dev/null | head -n 1 | xargs -I {} cp {} "$OUT_DIR/performance-baseline/" 2>/dev/null || true
ls -1 performance-results/*performance_data_* 2>/dev/null | head -n 1 | xargs -I {} cp {} "$OUT_DIR/performance-baseline/" 2>/dev/null || true

# Production readiness package
ls -d deployment-readiness-* 2>/dev/null | head -n 1 | xargs -I {} cp -R {} "$OUT_DIR/production-readiness/" 2>/dev/null || true
[ -f README_PRODUCTION.md ] && cp README_PRODUCTION.md "$OUT_DIR/production-readiness/deployment-procedures.md" || true

# Execution summary placeholder
cat > "$OUT_DIR/execution-summary.md" << EOF
# Execution Summary
- Generated at: $(date)
- This package contains server stability logs, E2E test artifacts, performance baseline, and readiness docs.
- Fill in manual validation results in production-readiness/validation-results.txt
EOF

# Create manual validation checklist
cat > "$OUT_DIR/production-readiness/validation-results.txt" << 'EOF'
# Manual Validation Results

## Routes Checked (Record load times, console errors = none)
- / : 
- /start : 
- /profile : 
- /leaderboard : 
- /about : 
- /privacy : 
- /quiz/programming : 
- /api/health : 

## RewardPopup (Homepage Quiz)
- 25 coins per correct answer: [ ] Yes  [ ] No  Notes:
- 0 coins for incorrect: [ ] Yes  [ ] No  Notes:
- onClaimReward/onSkipReward executed without errors: [ ] Yes  [ ] No

## State Persistence
- Coins persist after refresh: [ ] Yes  [ ] No
- Quiz history persists: [ ] Yes  [ ] No
- Context state restored: [ ] Yes  [ ] No

## Console Cleanliness
- No JS errors/warnings during flows: [ ] Yes  [ ] No

## Auth Flow
- No race conditions; proper loading states: [ ] Yes  [ ] No

## Notes
- 
EOF

# Compress
ARCHIVE="${OUT_DIR}.zip"
rm -f "$ARCHIVE"
zip -qr "$ARCHIVE" "$OUT_DIR"
echo "Created artifact package: $ARCHIVE"

