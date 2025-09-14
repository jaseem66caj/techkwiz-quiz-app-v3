# Quiz System Backup - Pre-Refactoring

**Backup Date**: 2025-09-09
**Purpose**: Complete backup before quiz data structure refactoring
**Rollback Instructions**: See bottom of this file

## Current System State

### Interface Definitions Backup

#### src/types/quiz.ts - QuizQuestion Interface (CANONICAL)
```typescript
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number  // snake_case - KEEP THIS FORMAT
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  question_type?: string
  fun_fact: string       // snake_case - KEEP THIS FORMAT
  category: string
  subcategory: string
  emoji_clue?: string
  visual_options?: string[]
  personality_trait?: string
  prediction_year?: string
  section?: 'onboarding' | 'homepage' | 'category' | 'general'
  tags?: string[]
  type?: 'regular' | 'bonus'
  createdAt?: number
  updatedAt?: number
}
```

#### src/types/admin.ts - QuizQuestion Interface (DUPLICATE - TO BE REMOVED)
```typescript
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;  // camelCase - CONVERT TO correct_answer
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  funFact: string;        // camelCase - CONVERT TO fun_fact
  category: string;
  subcategory: string;
  section?: 'onboarding' | 'homepage' | 'category' | 'general';
  tags?: string[];
  type?: 'regular' | 'bonus';
  createdAt?: number;
  updatedAt?: number;
}
```

### Quiz Categories Inventory

**Static Database Categories** (48 total questions):
1. `swipe-personality` - Personality questions (correct_answer: -1)
2. `pop-culture-flash` - Pop culture and social media
3. `micro-trivia` - Quick trivia facts
4. `social-identity` - Social media identity
5. `trend-vibes` - Gen Z slang and trends
6. `future-you` - Career and future predictions
7. `programming` - Programming and tech
8. `ai` - Artificial intelligence

### Current Data Flow

**Components with Direct Database Access**:
- `src/app/quiz/[category]/page.tsx` - Lines 136, 144
- `src/app/start/page.tsx` - Line 41

**Components with Manual Data Transformation**:
- `src/app/quiz/[category]/page.tsx` - Lines 122-131 (admin to quiz format conversion)

**Components with Inline Interface Definitions**:
- `src/app/quiz/[category]/page.tsx` - Lines 16-35
- `src/components/QuizInterface.tsx` - Lines 18-32
- `src/components/EnhancedQuizInterface.tsx` - Similar definition

### Files to be Modified

**Primary Files**:
1. `src/types/quiz.ts` - Canonical interface (keep snake_case)
2. `src/types/admin.ts` - Remove duplicate interface
3. `src/utils/quizDataManager.ts` - Enhance with unified access
4. `src/app/quiz/[category]/page.tsx` - Remove direct imports, use manager
5. `src/app/page.tsx` - Update to use centralized manager
6. `src/components/QuizInterface.tsx` - Remove inline interface
7. `src/components/EnhancedQuizInterface.tsx` - Remove inline interface

**Static Data**:
- `src/data/quizDatabase.ts` - Keep as-is (already uses correct format)

## Rollback Plan

### If Issues Occur During Refactoring:

1. **Immediate Rollback Commands**:
   ```bash
   git stash
   git reset --hard HEAD
   ```

2. **Restore Interface Definitions**:
   - Restore `src/types/admin.ts` QuizQuestion interface
   - Restore inline interfaces in components
   - Restore manual transformation logic

3. **Restore Component Logic**:
   - Restore direct `quizDatabase.ts` imports
   - Restore manual format conversion in `src/app/quiz/[category]/page.tsx`

4. **Test Rollback Success**:
   - Homepage quick quiz functionality
   - Category-specific quizzes
   - Admin dashboard (if applicable)

### Critical Success Criteria

**Before marking refactoring complete, verify**:
- [ ] All quiz categories load correctly
- [ ] Questions display with proper formatting
- [ ] Answer selection works correctly
- [ ] Fun facts display properly
- [ ] No console errors in browser
- [ ] Admin dashboard still functions (if applicable)
- [ ] Data persists across browser sessions

### Emergency Contacts

If rollback fails or data is corrupted:
1. Check this backup file for original interface definitions
2. Restore from git history: `git log --oneline | head -10`
3. Use git bisect if needed to find last working commit

**IMPORTANT**: Do not delete this backup file until refactoring is complete and tested.
