#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/jaseem/Documents/GitHub/Techkwiz-v8"
cd "$ROOT_DIR"

HEALTH_URL="http://localhost:3000/api/health"
LOG_FILE="logs/stability-monitor.log"
DURATION_MINUTES=${1:-30}
CHECK_INTERVAL_SECONDS=${2:-30}

log() { 
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $*" | tee -a "$LOG_FILE"
}

health_check() {
  if curl -s -f "$HEALTH_URL" >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

pm2_status() {
  pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="techkwiz-dev") | "\(.pm2_env.status) uptime:\(.pm2_env.pm_uptime) restarts:\(.pm2_env.restart_time)"' 2>/dev/null || echo "PM2 status unavailable"
}

memory_usage() {
  pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="techkwiz-dev") | "Memory: \(.monit.memory/1024/1024 | floor)MB CPU: \(.monit.cpu)%"' 2>/dev/null || echo "Memory info unavailable"
}

log "Starting $DURATION_MINUTES minute stability monitor for TechKwiz-v8"
log "Health endpoint: $HEALTH_URL"
log "Check interval: $CHECK_INTERVAL_SECONDS seconds"

start_time=$(date +%s)
end_time=$((start_time + DURATION_MINUTES * 60))
check_count=0
success_count=0
failure_count=0

while [ $(date +%s) -lt $end_time ]; do
  check_count=$((check_count + 1))
  
  if health_check; then
    success_count=$((success_count + 1))
    status="✅ HEALTHY"
  else
    failure_count=$((failure_count + 1))
    status="❌ FAILED"
  fi
  
  pm2_info=$(pm2_status)
  mem_info=$(memory_usage)
  
  elapsed_minutes=$(( ($(date +%s) - start_time) / 60 ))
  remaining_minutes=$(( DURATION_MINUTES - elapsed_minutes ))
  
  log "Check $check_count/$((DURATION_MINUTES * 60 / CHECK_INTERVAL_SECONDS)): $status | $pm2_info | $mem_info | Remaining: ${remaining_minutes}m"
  
  if [ $remaining_minutes -gt 0 ]; then
    sleep $CHECK_INTERVAL_SECONDS
  fi
done

total_time_minutes=$(( ($(date +%s) - start_time) / 60 ))
success_rate=$(( success_count * 100 / check_count ))

log "=== STABILITY MONITOR COMPLETE ==="
log "Duration: $total_time_minutes minutes"
log "Total checks: $check_count"
log "Successful: $success_count ($success_rate%)"
log "Failed: $failure_count"

if [ $success_rate -ge 95 ]; then
  log "✅ SERVER STABILITY: EXCELLENT ($success_rate% uptime)"
  exit 0
elif [ $success_rate -ge 90 ]; then
  log "⚠️  SERVER STABILITY: GOOD ($success_rate% uptime)"
  exit 0
else
  log "❌ SERVER STABILITY: POOR ($success_rate% uptime)"
  exit 1
fi
