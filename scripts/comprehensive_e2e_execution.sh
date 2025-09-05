#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/jaseem/Documents/GitHub/Techkwiz-v8"
cd "$ROOT_DIR"

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
EXECUTION_LOG="logs/e2e_execution_${TIMESTAMP}.log"
RESULTS_DIR="test-results-${TIMESTAMP}"

log() { 
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "$msg" | tee -a "$EXECUTION_LOG"
}

health_check() {
  curl -s -f http://localhost:3000/api/health >/dev/null 2>&1
}

wait_for_server() {
  local max_attempts=30
  local attempt=1
  
  log "Waiting for server to be ready..."
  while [ $attempt -le $max_attempts ]; do
    if health_check; then
      log "✅ Server ready after $attempt attempts"
      return 0
    fi
    log "⏳ Attempt $attempt/$max_attempts - server not ready"
    sleep 2
    attempt=$((attempt + 1))
  done
  
  log "❌ Server failed to start after $max_attempts attempts"
  return 1
}

start_server_with_fallback() {
  log "=== TASK 1.1: Server Startup and Stability Validation ==="
  
  # Clean environment
  pm2 delete all 2>/dev/null || true
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  sleep 2
  
  # Try PM2 production first
  log "Attempting PM2 production startup..."
  if npm run pm2:prod && wait_for_server; then
    log "✅ PM2 production server started successfully"
    return 0
  fi
  
  # Fallback to PM2 development
  log "PM2 production failed, trying PM2 development..."
  pm2 delete all 2>/dev/null || true
  if npm run pm2:dev && wait_for_server; then
    log "✅ PM2 development server started successfully"
    return 0
  fi
  
  # Final fallback to direct npm
  log "PM2 failed, trying direct npm start..."
  pm2 delete all 2>/dev/null || true
  NODE_OPTIONS="--max-old-space-size=4096" npm run dev &
  DEV_PID=$!
  echo $DEV_PID > .server.pid
  
  if wait_for_server; then
    log "✅ Direct npm development server started successfully"
    return 0
  fi
  
  log "❌ All server startup methods failed"
  return 1
}

execute_stability_check() {
  log "=== Executing 1-minute stability check ==="
  if ./scripts/server_stability_monitor.sh 1 10; then
    log "✅ Short stability check passed"
    return 0
  else
    log "❌ Short stability check failed"
    return 1
  fi
}

execute_route_validation() {
  log "=== Executing route validation ==="
  if ./scripts/test_route_fixes.sh; then
    log "✅ Route validation passed"
    return 0
  else
    log "❌ Route validation failed"
    return 1
  fi
}

execute_e2e_tests() {
  log "=== TASK 1.2: Comprehensive Test Execution ==="
  
  # Start background monitoring
  log "Starting background server monitoring..."
  ./scripts/server_stability_monitor.sh 30 30 > "logs/background_monitor_${TIMESTAMP}.log" 2>&1 &
  MONITOR_PID=$!
  echo $MONITOR_PID > .monitor.pid
  
  # Execute E2E tests
  log "Starting Playwright E2E test suite..."
  mkdir -p "$RESULTS_DIR"
  
  if npm run test:e2e:stable; then
    log "✅ E2E test suite completed successfully"
    TEST_SUCCESS=true
  else
    log "❌ E2E test suite failed"
    TEST_SUCCESS=false
  fi
  
  # Stop background monitoring
  if [ -f .monitor.pid ]; then
    kill $(cat .monitor.pid) 2>/dev/null || true
    rm .monitor.pid
  fi
  
  return $TEST_SUCCESS
}

analyze_test_results() {
  log "=== TASK 1.3: Test Results Analysis ==="
  
  # Copy test artifacts
  if [ -d "test-results" ]; then
    cp -r test-results/* "$RESULTS_DIR/" 2>/dev/null || true
  fi
  
  if [ -d "playwright-report" ]; then
    cp -r playwright-report "$RESULTS_DIR/playwright-report" 2>/dev/null || true
  fi
  
  if [ -f "test-results.json" ]; then
    cp test-results.json "$RESULTS_DIR/" 2>/dev/null || true
  fi
  
  # Generate analysis report
  cat > "$RESULTS_DIR/execution_summary.md" << EOF
# E2E Test Execution Summary
**Execution Time:** $(date)
**Results Directory:** $RESULTS_DIR

## Server Startup Method
$(if pm2 list 2>/dev/null | grep -q "online"; then echo "✅ PM2 (stable)"; else echo "⚠️ Direct npm (fallback)"; fi)

## Test Results
$(if [ -f "test-results.json" ]; then
  echo "### Overall Results"
  jq -r '.stats | "- Total Tests: \(.total)\n- Passed: \(.passed)\n- Failed: \(.failed)\n- Skipped: \(.skipped)"' test-results.json 2>/dev/null || echo "- Results parsing failed"
else
  echo "- No test-results.json found"
fi)

## Artifacts Generated
- Execution log: $EXECUTION_LOG
- Test results: $RESULTS_DIR/
- Playwright report: $RESULTS_DIR/playwright-report/
- Background monitoring: logs/background_monitor_${TIMESTAMP}.log

## Next Steps
1. Review Playwright report: npx playwright show-report
2. Analyze failed tests in $RESULTS_DIR/
3. Check server stability logs in logs/
EOF

  log "✅ Test results analysis completed"
  log "📊 Results summary: $RESULTS_DIR/execution_summary.md"
}

cleanup() {
  log "=== Cleanup ==="
  
  # Stop monitoring
  if [ -f .monitor.pid ]; then
    kill $(cat .monitor.pid) 2>/dev/null || true
    rm .monitor.pid
  fi
  
  # Stop server (optional - leave running for manual testing)
  # pm2 delete all 2>/dev/null || true
  # if [ -f .server.pid ]; then
  #   kill $(cat .server.pid) 2>/dev/null || true
  #   rm .server.pid
  # fi
  
  log "✅ Cleanup completed"
}

main() {
  log "🚀 Starting Comprehensive E2E Test Execution"
  log "Working directory: $ROOT_DIR"
  log "Execution log: $EXECUTION_LOG"
  
  mkdir -p logs
  
  # Task 1.1: Server startup and stability
  if ! start_server_with_fallback; then
    log "❌ CRITICAL: Server startup failed"
    exit 1
  fi
  
  if ! execute_stability_check; then
    log "⚠️ WARNING: Stability check failed, proceeding with caution"
  fi
  
  # Validate routes before E2E tests
  if ! execute_route_validation; then
    log "⚠️ WARNING: Route validation failed, some tests may fail"
  fi
  
  # Task 1.2: E2E test execution
  execute_e2e_tests
  
  # Task 1.3: Results analysis
  analyze_test_results
  
  log "🎉 Comprehensive E2E Test Execution completed"
  log "📋 Check results in: $RESULTS_DIR/"
  log "🖥️ View Playwright report: npx playwright show-report"
}

# Set up cleanup trap
trap cleanup EXIT

# Execute main function
main "$@"
