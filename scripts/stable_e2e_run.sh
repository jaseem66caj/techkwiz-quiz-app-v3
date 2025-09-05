#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/jaseem/Documents/GitHub/Techkwiz-v8"
cd "$ROOT_DIR"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

health() { curl -s -f http://localhost:3000/api/health >/dev/null; }

wait_ready() {
  local attempts=${1:-30}
  for i in $(seq 1 "$attempts"); do
    if health; then return 0; fi
    sleep 1
  done
  return 1
}

stability_checks() {
  for i in {1..6}; do
    sleep 5
    if health; then log "Stable check $i/6: OK"; else log "Stable check $i/6: FAILED"; return 1; fi
  done
  return 0
}

kill_port() {
  log "Cleaning port 3000..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  sleep 1
}

start_dev() {
  log "Starting Next.js dev with increased memory..."
  NODE_OPTIONS="--max-old-space-size=4096" npm run dev &
  DEV_PID=$!
  echo $DEV_PID > .server.pid
}

start_prod() {
  log "Building for production..."
  npm run build
  log "Starting production server..."
  npm run start &
  PROD_PID=$!
  echo $PROD_PID > .server.pid
}

start_pm2() {
  if ! command -v pm2 >/dev/null 2>&1; then
    log "Installing PM2 globally..."
    npm install -g pm2
  fi
  log "Starting dev server via PM2..."
  pm2 start "npm run dev -- --port 3000" --name techkwiz-dev || true
}

run_tests() {
  log "Running Playwright e2e (sequential, retries=2, timeout=90s)..."
  npx playwright test --timeout=90000 --retries=2 --workers=1 --reporter=line || return 1
}

monitor_bg() {
  while true; do
    sleep 30
    if health; then log "Server OK"; else log "Server DOWN"; fi
  done &
  MON_PID=$!
}

log "Working dir: $ROOT_DIR"
kill_port

# Try dev
start_dev || true
sleep 2
if wait_ready 30 && stability_checks; then
  log "Dev server stable."
else
  log "Dev unstable. Trying production..."
  kill_port
  start_prod || true
  sleep 2
  if wait_ready 30 && stability_checks; then
    log "Production server stable."
  else
    log "Production unstable. Trying PM2..."
    kill_port
    start_pm2
    sleep 5
    if ! wait_ready 60 || ! stability_checks; then
      log "PM2 also unstable. Exiting with failure."; exit 1
    fi
  fi
fi

monitor_bg
run_tests || { log "Tests failed"; exit 1; }
log "Tests completed. Reports: playwright-report/, test-results.json"

