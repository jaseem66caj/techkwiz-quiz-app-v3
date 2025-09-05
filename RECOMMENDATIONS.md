# Techkwiz-v8 Maintenance Recommendations

This document lists prioritized, actionable maintenance items with effort estimates and expected impact.

## High Priority (Security, Reliability)
- Update Next.js from 15.4.4 to 15.5.2
  - Why: npm audit reports multiple advisories fixed in 15.5.2
  - Effort: 0.5 day (test + build)
  - Impact: Security, stability
- Fix build-time type error in src/app/quiz/[category]/page.tsx (RewardPopup props)
  - Why: next build currently fails; blocks production builds
  - Effort: 0.5 day (prop alignment + test)
  - Impact: CI pass, deployability

## Medium Priority (Performance, Hygiene)
- Remove extraneous/unused packages (recharts, redux, victory-vendor, d3*, etc.)
  - Why: Reduce install size, attack surface; not used in src/
  - Effort: 0.5 day
  - Impact: Smaller node_modules, faster CI
- Consolidate RewardPopups (NewRewardPopup vs EnhancedRewardPopup vs UnifiedRewardPopup)
  - Why: Reduce duplication; consistent UX
  - Effort: 1 day
  - Impact: Smaller bundle, easier maintenance
- Enable and configure Google Analytics via settingsDataManager or env
  - Why: Observability; currently disabled
  - Effort: 0.5 day
  - Impact: Insight into usage

## Low Priority (DX, Quality)
- Upgrade ESLint to v9 and align eslint-config-next if compatible
  - Effort: 0.5 day
- Consider lightweight state lib (Zustand) if app grows
  - Effort: 1–2 days
- Expand tests beyond visual: add unit/integration for utils and hooks
  - Effort: ongoing

## Notes
- Tailwind v4 is available; defer until Next 15.5.2 upgrade is complete.
- Maintain repo-root Next.js app (aligns with Vercel auto-detect); consider removing duplicate frontend/ copy if not needed.

