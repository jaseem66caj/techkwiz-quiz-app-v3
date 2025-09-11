---
trigger: always_on
alwaysApply: true
---
# Reward System Governance Rules

**Type:** always_apply  
**Priority:** High  
**Scope:** All reward-related code changes

## Overview

This document establishes immutable business rules for the TechKwiz reward system to ensure consistency, prevent configuration drift, and maintain standardized coin distribution across all quiz interfaces.

## Standardized Coin Values (IMMUTABLE)

The following coin values are standardized and MUST NOT be changed without explicit business approval:

### Core Reward Values
- **Correct Answer:** 50 coins
- **Incorrect Answer:** 0 coins  
- **Bonus Question:** 50 coins (additional, totaling 100 coins for correct bonus answers)
- **Daily Bonus:** 0 coins (DISABLED)
- **Streak Bonus:** 10 coins per streak length
- **Ad Rewards:** 0 coins (DISABLED)

### Configuration Location
All coin values MUST be defined in `src/types/reward.ts` in the `DEFAULT_REWARD_CONFIG` constant:

```typescript
export const DEFAULT_REWARD_CONFIG = {
  coinValues: {
    correct: 50,
    incorrect: 0,
    bonus: 50,
    dailyBonus: 0,
    streakBonus: 10
  },
  adSettings: {
    enabled: false,
    rewardCoins: 0
  }
}
```

## Mandatory Implementation Rules

### 1. Centralized Configuration Enforcement
- **RULE:** All coin calculations MUST reference `DEFAULT_REWARD_CONFIG` or use the centralized reward calculator utility
- **PROHIBITED:** Hardcoded coin values anywhere in the codebase
- **UTILITY:** Use functions from `src/utils/rewardCalculator.ts` for all coin calculations

### 2. Consistent Calculation Methods
- **Homepage Quiz:** Use `calculateQuizReward()` for total coins
- **Category Quizzes:** Use `calculateCorrectAnswerReward()` for individual answers
- **Bonus Questions:** Use `calculateBonusReward()` for bonus calculations
- **Providers:** Use centralized calculation in quiz completion logic

### 3. Component Integration Requirements
Components that display or calculate coins MUST use centralized configuration:
- `src/app/providers.tsx` - Quiz completion rewards
- `src/app/page.tsx` - Homepage quiz rewards  
- `src/app/quiz/[category]/page.tsx` - Category quiz rewards
- `src/components/RewardPopup.tsx` - Reward display
- `src/components/EnhancedRewardPopup.tsx` - Enhanced reward display

## Validation and Testing Requirements

### 1. Code Review Checklist
Before approving any reward-related changes, verify:
- [ ] No hardcoded coin values (25, 50, 100, etc.)
- [ ] All calculations use `rewardCalculator.ts` functions
- [ ] Configuration references `DEFAULT_REWARD_CONFIG`
- [ ] Ad rewards remain disabled (`enabled: false`, `rewardCoins: 0`)
- [ ] Daily bonus remains disabled (`dailyBonus: 0`)

### 2. Testing Requirements
All reward system changes MUST be tested to verify:
- [ ] Homepage quiz awards 50 coins per correct answer
- [ ] Category quizzes award 50 coins per correct answer
- [ ] Bonus questions award 100 total coins (50 base + 50 bonus)
- [ ] Incorrect answers award 0 coins
- [ ] Reward popups display accurate coin amounts
- [ ] No ad reward opportunities are shown
- [ ] Daily bonus is not awarded

### 3. Consistency Validation
Use the `validateRewardConsistency()` function from `rewardCalculator.ts` to ensure configuration integrity during development.

## Change Management Process

### 1. Prohibited Changes (Without Business Approval)
- Modifying coin values in `DEFAULT_REWARD_CONFIG`
- Re-enabling ad rewards or daily bonuses
- Adding hardcoded coin calculations
- Bypassing centralized reward calculation utilities

### 2. Approved Change Process
For any reward system modifications:
1. **Business Justification:** Document business need and impact analysis
2. **Configuration Update:** Modify only `DEFAULT_REWARD_CONFIG` values
3. **Testing:** Complete full regression testing of all quiz interfaces
4. **Documentation:** Update this governance document
5. **Approval:** Require explicit approval from product owner

### 3. Emergency Override
In case of critical issues:
1. Document the emergency and temporary fix
2. Create immediate plan to restore proper configuration
3. Schedule permanent fix within 24 hours
4. Update governance rules if needed

## Monitoring and Compliance

### 1. Automated Checks
- Code linting rules should flag hardcoded coin values
- CI/CD pipeline should validate reward configuration consistency
- Unit tests should verify centralized calculation usage

### 2. Regular Audits
- Monthly review of reward-related code changes
- Quarterly validation of coin distribution consistency
- Annual review of governance rules effectiveness

## Violation Consequences

### 1. Code Review Failures
- Immediate rejection of PRs with hardcoded values
- Required refactoring to use centralized configuration
- Additional testing requirements for violating changes

### 2. Production Issues
- Immediate rollback of changes causing reward inconsistencies
- Post-incident review to prevent future violations
- Enhanced monitoring for affected components

## Contact and Escalation

For questions about reward system governance:
- **Technical Issues:** Development team lead
- **Business Changes:** Product owner approval required
- **Emergency Issues:** Follow standard incident response procedures

---

**Last Updated:** 2025-09-09  
**Next Review:** 2025-12-09  
**Version:** 1.0
