# TechKwiz-v8 Production Deployment Guide

## Quick Start (Production)

```bash
# 1. Install dependencies
npm ci

# 2. Start production server with PM2
npm run pm2:prod

# 3. Verify server health
curl -s -f http://localhost:3000/api/health

# 4. Monitor server stability
./scripts/server_stability_monitor.sh 30 30
```

## Development Setup

```bash
# 1. Install dependencies
npm ci

# 2. Start development server with PM2 (recommended)
npm run pm2:dev

# 3. Alternative: Direct development server
npm run dev
```

## Health Monitoring

### Server Health Check
```bash
# Quick health check
curl -s -f http://localhost:3000/api/health

# Extended stability monitoring (30 minutes)
./scripts/server_stability_monitor.sh 30 30
```

### Route Validation
```bash
# Test all routes for redirect loops and timeouts
./scripts/test_route_fixes.sh
```

## Testing

### E2E Testing
```bash
# Comprehensive E2E test suite
./scripts/comprehensive_e2e_execution.sh

# Manual Playwright execution
npm run test:e2e:stable
```

### Performance Testing
```bash
# Performance validation across all routes and viewports
node scripts/performance_validation.js
```

## PM2 Management

```bash
# Start production server
npm run pm2:prod

# Start development server
npm run pm2:dev

# Check status
npm run pm2:status

# View logs
npm run pm2:logs

# Restart server
npm run pm2:restart

# Stop server
npm run pm2:stop
```

## Troubleshooting

### Server Termination Issues
1. Check PM2 logs: `npm run pm2:logs`
2. Restart with PM2: `npm run pm2:restart`
3. If PM2 fails, use direct startup: `NODE_OPTIONS="--max-old-space-size=4096" npm run dev`

### Route Redirect Loops
- **Root Cause**: Race condition in auth flow initialization
- **Solution**: Fixed with proper loading state coordination
- **Validation**: Run `./scripts/test_route_fixes.sh`

### Static Page Timeouts
- **Root Cause**: Complex Navigation component dependencies
- **Solution**: SimpleNavigation component for static pages
- **Affected Routes**: `/about`, `/privacy`

### Performance Issues
- **Monitoring**: Use `node scripts/performance_validation.js`
- **Targets**: FCP <3s, TTI <4s, CLS <0.1
- **Optimization**: Static pages now use simplified navigation

## Production Deployment Checklist

- [ ] Server starts successfully with PM2
- [ ] Health endpoint responds: `curl -s -f http://localhost:3000/api/health`
- [ ] All routes accessible: `./scripts/test_route_fixes.sh`
- [ ] 30+ minutes server stability: `./scripts/server_stability_monitor.sh 30 30`
- [ ] Performance targets met: `node scripts/performance_validation.js`
- [ ] E2E tests passing: `./scripts/comprehensive_e2e_execution.sh`

## Architecture Notes

### Route Fixes Implemented
- **Redirect Loops**: Fixed race condition in auth flow (`/start`, `/profile`, `/leaderboard`)
- **Static Page Timeouts**: SimpleNavigation component (`/about`, `/privacy`)
- **Loading States**: Proper coordination between Providers and page components

### Server Stability
- **PM2 Configuration**: `ecosystem.config.js` with memory limits and restart policies
- **Health Monitoring**: `/api/health` endpoint with automated monitoring scripts
- **Fallback Strategy**: PM2 → Direct npm startup hierarchy

### Performance Optimizations
- **Static Pages**: Reduced bundle size with SimpleNavigation
- **Auth Flow**: Eliminated race conditions and unnecessary re-renders
- **Memory Management**: Increased Node.js memory limits for stability
