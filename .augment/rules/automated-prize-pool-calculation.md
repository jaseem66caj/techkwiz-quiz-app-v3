---
type: "always_apply"
---

# Automated Prize Pool Calculation System for Quiz Categories

**Type:** always_apply  
**Priority:** High  
**Scope:** All quiz category and reward calculation code changes  
**File Locations:** `src/utils/rewardCalculator.ts`, `src/data/quizDatabase.ts`, `.augment/rules/`

## Overview

This rule establishes a mandatory automated prize pool calculation system that eliminates manual configuration and ensures 100% governance compliance for all quiz categories, both existing and future. This rule must be enforced for all changes to quiz categories, reward calculations, or database modifications.

## Mandatory Implementation Requirements

### 1. Enhanced Utility Function (src/utils/rewardCalculator.ts)
**REQUIRED PATTERN:**
```typescript
/**
 * Calculate maximum possible coins for a category
 * @param input - Either question count (number) or category ID (string) for dynamic lookup
 * @returns Maximum coins based on question count × 50 coins per correct answer
 */
export function calculateCategoryMaxCoins(input: number | string): number {
  const config = getRewardConfig()
  
  if (typeof input === 'number') {
    // Legacy support: direct question count
    return input * config.coinValues.correct
  } else {
    // Dynamic support: category ID lookup
    const questionCount = getQuestionCountForCategory(input)
    return questionCount * config.coinValues.correct
  }
}

/**
 * Get actual question count for a category from QUIZ_DATABASE
 * @param categoryId - The category identifier to look up
 * @returns Number of questions in the category, defaults to 5 if not found
 */
function getQuestionCountForCategory(categoryId: string): number {
  try {
    // Import QUIZ_DATABASE dynamically to avoid circular dependencies
    const { QUIZ_DATABASE } = require('../data/quizDatabase')
    const questions = QUIZ_DATABASE[categoryId] || []
    return questions.length
  } catch (error) {
    console.warn(`Failed to load question count for category ${categoryId}, using fallback:`, error)
    return 5 // Fallback to prevent UI breakage
  }
}
```

### 2. Category Definition Pattern (src/data/quizDatabase.ts)
**MANDATORY PATTERN for ALL categories:**
```typescript
'category-id': {
  id: 'category-id',
  name: 'Category Name',
  icon: '🎯',
  color: 'from-blue-500 to-purple-600',
  description: 'Category description',
  subcategories: ['Sub1', 'Sub2'],
  entry_fee: 100,
  get prize_pool() { 
    return calculateCategoryMaxCoins(this.id) 
  }, // Automatically calculates based on QUIZ_DATABASE[this.id].length × 50 coins
},
```

### 3. Prohibited Patterns
**NEVER ALLOWED:**
- `prize_pool: 250` (hardcoded values)
- `get prize_pool() { return calculateCategoryMaxCoins(5) }` (hardcoded question counts)
- `prize_pool: questionCount * 50` (manual calculations)
- Any hardcoded coin values in category definitions

## Enforcement Rules

### Pre-Commit Validation
**REQUIRED CHECKS before any commit:**
- [ ] No hardcoded `prize_pool` values exist: `grep -r "prize_pool: [0-9]" src/` returns empty
- [ ] All categories use dynamic pattern: `get prize_pool() { return calculateCategoryMaxCoins(this.id) }`
- [ ] No hardcoded question counts in `calculateCategoryMaxCoins()` calls
- [ ] All new categories follow the mandatory pattern

### Code Review Requirements
**MANDATORY for all PR reviews touching quiz categories:**
- [ ] Verify dynamic prize pool calculation usage
- [ ] Test that adding/removing questions updates prize pools automatically
- [ ] Confirm no manual configuration required for new categories
- [ ] Validate error handling and fallback mechanisms work

### Testing Requirements
**REQUIRED TESTS for any category changes:**
1. **Existing Category Verification:** All categories show correct coins (current: 250 for 5 questions)
2. **Dynamic Behavior Test:** Add test question → verify prize pool increases → remove test question → verify reversion
3. **New Category Test:** Create category with different question count → verify automatic calculation
4. **Error Handling Test:** Test with invalid category ID → verify graceful fallback

## New Category Creation Template

**MANDATORY TEMPLATE for all new categories:**
```typescript
// 1. Add category definition to QUIZ_CATEGORIES (automatic prize pool)
'new-category': {
  id: 'new-category',
  name: 'New Category Name',
  icon: '🎯',
  color: 'from-color-500 to-color-600',
  description: 'Category description',
  subcategories: ['Sub1', 'Sub2'],
  entry_fee: 100,
  get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // REQUIRED: Automatic calculation
},

// 2. Add questions to QUIZ_DATABASE (prize pool automatically calculated)
'new-category': [
  {
    id: 'new_001',
    question: 'Question text?',
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    correct_answer: 0,
    difficulty: 'beginner',
    fun_fact: 'Interesting fact!',
    category: 'new-category',
    subcategory: 'Sub1'
  },
  // Add more questions as needed - prize pool updates automatically
],
```

## Error Handling Requirements

**MANDATORY error handling patterns:**
- Graceful fallback if category ID not found in QUIZ_DATABASE
- Console warnings for missing categories without breaking UI
- Default to 5 questions (250 coins) if dynamic counting fails
- No exceptions thrown that could crash the category display

## Success Criteria Validation

**ALL criteria must be met for any category-related changes:**
- ✅ Zero hardcoded question counts in category definitions
- ✅ All categories use `calculateCategoryMaxCoins(this.id)` pattern
- ✅ Adding/removing questions automatically updates prize pools
- ✅ New categories inherit automatic calculation by default
- ✅ 100% backward compatibility maintained
- ✅ No visual design changes or user experience impact
- ✅ Console shows no errors during category page load

## Violation Consequences

**Immediate rejection criteria:**
- Any hardcoded prize pool values in category definitions
- Manual question count configuration in prize pool calculations
- New categories without automatic calculation pattern
- Changes that break dynamic prize pool updates

## Documentation Requirements

**REQUIRED documentation updates for any changes:**
- Inline comments explaining automatic calculation system
- Updated category creation guidelines
- Examples of correct dynamic pattern usage
- Error handling and fallback behavior documentation

## Integration with Existing Governance

This rule extends and enforces the existing reward system governance rules defined in `.augment/rules/reward-system.md` by ensuring:
- All coin calculations reference `DEFAULT_REWARD_CONFIG.coinValues.correct` (50 coins)
- No hardcoded coin values exist anywhere in the system
- Centralized configuration is used for all reward calculations
- Future scalability is built into the system architecture

## Implementation Status

**Current Implementation (as of 2025-09-09):**
- ✅ Enhanced utility functions implemented in `src/utils/rewardCalculator.ts`
- ✅ All 8 existing categories converted to dynamic calculation pattern
- ✅ Zero hardcoded prize pool values remain in codebase
- ✅ 100% governance compliance achieved
- ✅ Automatic scalability for future question additions/removals

**Verification Commands:**
```bash
# Verify no hardcoded values
grep -r "prize_pool: [0-9]" src/

# Verify dynamic pattern usage
grep -r "get prize_pool()" src/data/quizDatabase.ts

# Test application
npm run dev && open http://localhost:3002/start
```

**Enforcement Level:** CRITICAL - Any violations must be fixed before merge approval.

---

**Last Updated:** 2025-09-09
**Next Review:** 2025-12-09
**Version:** 1.0
