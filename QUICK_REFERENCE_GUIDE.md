# Quiz System - Quick Reference Guide

## 🚀 For Developers

### Adding New Quiz Questions

**✅ DO THIS** (New Centralized Way):
```typescript
import { quizDataManager } from '@/utils/quizDataManager'

// Add a new question through the centralized manager
const newQuestion = {
  question: "What is React?",
  options: ["Library", "Framework", "Language", "Database"],
  correct_answer: 0,
  difficulty: "beginner",
  fun_fact: "React was created by Facebook in 2013!",
  category: "programming",
  subcategory: "frontend"
}

quizDataManager.saveQuestion(newQuestion)
```

**❌ DON'T DO THIS** (Old Direct Way):
```typescript
// Don't directly import quizDatabase.ts anymore
import { QUIZ_DATABASE } from '@/data/quizDatabase' // ❌ Avoid this
```

### Loading Quiz Questions

**✅ DO THIS** (New Unified Way):
```typescript
import { quizDataManager } from '@/utils/quizDataManager'

// Get questions with intelligent fallback
const questions = await quizDataManager.getUnifiedQuestions('programming', 5)
```

**❌ DON'T DO THIS** (Old Manual Way):
```typescript
// Don't manually handle fallbacks anymore
const adminQuestions = getAdminQuestions() // ❌ Avoid manual fallback logic
if (adminQuestions.length < 3) {
  const staticQuestions = QUIZ_DATABASE['programming'] // ❌ Avoid direct access
}
```

### Interface Usage

**✅ DO THIS** (Unified Interface):
```typescript
import { QuizQuestion } from '@/types/quiz'

const question: QuizQuestion = {
  id: "q1",
  question: "Test question?",
  options: ["A", "B", "C", "D"],
  correct_answer: 1,        // ✅ snake_case
  fun_fact: "Test fact",    // ✅ snake_case
  // ... other properties
}
```

**❌ DON'T DO THIS** (Old Inconsistent Format):
```typescript
const question = {
  correctAnswer: 1,    // ❌ camelCase (old format)
  funFact: "Test"      // ❌ camelCase (old format)
}
```

## 🛠️ System Architecture

### Data Flow (New)
```
Component → QuizDataManager.getUnifiedQuestions() → Intelligent Fallback:
                                                   ├── 1. Admin Questions (localStorage)
                                                   ├── 2. Static Database (quizDatabase.ts)
                                                   └── 3. Sample Data (emergency)
```

### Caching System
- **LRU Cache**: 5-minute TTL, max 50 categories
- **Static DB Cache**: Cached after first import
- **Migration Cache**: Validated questions cached per category

### Error Handling
- **Error Boundary**: `QuizErrorBoundary` wraps quiz components
- **Graceful Fallbacks**: System never crashes, always provides questions
- **Logging**: All errors logged to localStorage for debugging

## 🧪 Testing Your Changes

### 1. Basic Functionality Test
```bash
npm run dev
# Visit: http://localhost:3003
# Test: Homepage quiz works
# Test: Category pages load (/quiz/programming, /quiz/ai, etc.)
```

### 2. Performance Test
```bash
# Check caching is working (subsequent loads should be faster)
curl -w "%{time_total}" http://localhost:3003/quiz/programming
curl -w "%{time_total}" http://localhost:3003/quiz/programming  # Should be faster
```

### 3. Error Handling Test
```javascript
// Run in browser console
localStorage.setItem('quiz_questions', 'invalid-json')
// Reload page - should still work with fallback
```

## 🚨 Troubleshooting

### Common Issues

**Issue**: "Questions not loading"
```bash
# Check console for errors
# Verify fallback is working:
curl http://localhost:3003/quiz/any-category  # Should always return 200
```

**Issue**: "Interface type errors"
```typescript
// Make sure you're using the unified interface
import { QuizQuestion } from '@/types/quiz'  // ✅ Correct
// Not from admin.ts or inline definitions
```

**Issue**: "Performance problems"
```javascript
// Check cache stats in browser console
quizDataManager.getCacheStats()
// Clear cache if needed
quizDataManager.clearCache()
```

### Debug Information

**View Error Logs**:
```javascript
// In browser console
console.log('Quiz Errors:', JSON.parse(localStorage.getItem('quiz_errors') || '[]'))
console.log('Data Errors:', JSON.parse(localStorage.getItem('quiz_data_errors') || '[]'))
console.log('Load Errors:', JSON.parse(localStorage.getItem('quiz_load_errors') || '[]'))
```

**View Analytics**:
```javascript
// In browser console
console.log('Analytics:', JSON.parse(localStorage.getItem('quiz_analytics') || '[]'))
```

**Clear All Data** (if needed):
```javascript
// In browser console - use with caution!
quizDataManager.clearCache()
quizDataManager.clearAnalyticsData()
localStorage.clear()
```

## 🔄 Rollback Procedure (Emergency)

If something goes wrong:

1. **Immediate Rollback**:
```bash
git stash
git reset --hard HEAD~1  # Go back one commit
npm run dev
```

2. **Restore Original Files**:
```bash
cp backup/quizDatabase-original.ts src/data/quizDatabase.ts
cp backup/quizDataManager-original.ts src/utils/quizDataManager.ts
cp backup/quiz-types-original.ts src/types/quiz.ts
cp backup/admin-types-original.ts src/types/admin.ts
```

3. **Verify Rollback**:
```bash
npm run build  # Should succeed
npm run dev    # Should work as before
```

## 📞 Support

**Files to Check**:
- `REFACTORING_SUMMARY.md` - Complete technical details
- `backup/quiz-system-backup.md` - Backup instructions
- `test-error-scenarios.js` - Error testing script

**Key Files Modified**:
- `src/types/quiz.ts` - Canonical interface
- `src/utils/quizDataManager.ts` - Centralized manager
- `src/utils/quizDataMigration.ts` - Migration utilities
- `src/components/QuizErrorBoundary.tsx` - Error boundary

**Performance Monitoring**:
- Check browser console for cache hit/miss logs
- Monitor load times for quiz pages
- Watch for any error messages in console

---
*Quick Reference Guide - Updated 2025-09-09*
