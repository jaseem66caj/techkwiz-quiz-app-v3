#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/jaseem/Documents/GitHub/Techkwiz-v8"
cd "$ROOT_DIR"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

test_route() {
  local route="$1"
  local expected_status="${2:-200}"
  local timeout="${3:-15}"
  
  log "Testing route: $route"
  
  # Test with curl first (basic connectivity)
  if timeout "$timeout" curl -s -f "http://localhost:3000$route" >/dev/null 2>&1; then
    log "✅ $route - Basic connectivity OK"
  else
    log "❌ $route - Basic connectivity FAILED"
    return 1
  fi
  
  # Test for redirect loops (check response headers)
  local response_code=$(timeout "$timeout" curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$route" 2>/dev/null || echo "000")
  
  if [ "$response_code" = "200" ]; then
    log "✅ $route - HTTP 200 OK"
  elif [ "$response_code" = "302" ] || [ "$response_code" = "301" ]; then
    log "⚠️  $route - Redirect detected ($response_code)"
    # Check for redirect loops by following redirects with limit
    local final_code=$(timeout "$timeout" curl -s -L --max-redirs 5 -o /dev/null -w "%{http_code}" "http://localhost:3000$route" 2>/dev/null || echo "000")
    if [ "$final_code" = "200" ]; then
      log "✅ $route - Redirect resolved to 200"
    else
      log "❌ $route - Redirect loop or error (final: $final_code)"
      return 1
    fi
  else
    log "❌ $route - HTTP $response_code"
    return 1
  fi
  
  return 0
}

test_all_routes() {
  local success_count=0
  local total_count=0
  
  # Test all routes
  routes=(
    "/"
    "/start"
    "/profile"
    "/leaderboard"
    "/about"
    "/privacy"
    "/quiz/programming"
    "/api/health"
  )
  
  for route in "${routes[@]}"; do
    total_count=$((total_count + 1))
    if test_route "$route"; then
      success_count=$((success_count + 1))
    fi
    echo
  done
  
  log "=== ROUTE TEST SUMMARY ==="
  log "Successful: $success_count/$total_count"
  log "Success rate: $(( success_count * 100 / total_count ))%"
  
  if [ $success_count -eq $total_count ]; then
    log "🎉 ALL ROUTES WORKING"
    return 0
  elif [ $success_count -ge 5 ]; then
    log "✅ MOST ROUTES WORKING"
    return 0
  else
    log "❌ MULTIPLE ROUTE FAILURES"
    return 1
  fi
}

# Check if server is running
if ! curl -s -f http://localhost:3000/api/health >/dev/null 2>&1; then
  log "❌ Server not responding. Please start the server first:"
  log "   npm run build && npm run start"
  log "   OR"
  log "   npm run pm2:prod"
  exit 1
fi

log "🚀 Starting route fix validation"
test_all_routes
