# TechKwiz Coding Standards

**Version 1.0** | **Last Updated:** September 14, 2025 | **Maintained by:** TechKwiz Development Team

## 🎯 Overview

This document defines the coding standards and best practices for the TechKwiz Quiz App. It provides guidelines for code structure, naming conventions, component design, state management, and testing to ensure consistency, maintainability, and quality across the codebase.

## 📁 File Structure and Organization

### Directory Structure
Follow the established project structure:

```
src/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Homepage
│   ├── providers.tsx      # Application providers
│   ├── global-error.tsx   # Global error boundary
│   ├── globals.css        # Global styles
│   ├── robots.ts          # Robots.txt configuration
│   ├── sitemap.ts         # Sitemap generation
│   ├── api/               # API routes
│   ├── about/             # About page
│   ├── privacy/           # Privacy page
│   ├── profile/           # User profile page
│   ├── leaderboard/       # Leaderboard page
│   ├── start/             # Category selection page
│   └── quiz/[category]/   # Dynamic quiz pages
├── components/            # Reusable UI components
│   ├── ads/               # Advertisement components
│   ├── analytics/         # Analytics components
│   ├── layout/            # Layout components
│   ├── modals/            # Modal components
│   ├── navigation/        # Navigation components
│   ├── quiz/              # Quiz-related components
│   ├── rewards/           # Reward-related components
│   ├── ui/                # General UI components
│   └── user/              # User-related components
├── data/                  # Static data and database
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── config/                # Configuration files
```

### File Naming Conventions
- Use PascalCase for component files (e.g., `UserProfile.tsx`)
- Use camelCase for utility files (e.g., `authUtils.ts`)
- Use kebab-case for CSS files (e.g., `quiz-styles.css`)
- Use descriptive names that indicate the file's purpose

## 🧩 Component Development Standards

### Component Structure
All React components should follow this structure:

```tsx
// Component description
'use client' // if client component

import { useState } from 'react'
// Other imports

interface ComponentProps {
  // Props interface
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
  
  return (
    // JSX
  )
}
```

### Component Design Principles
1. **Single Responsibility**: Each component should have one clear purpose
2. **Reusability**: Components should be designed to be used in multiple contexts
3. **Composition**: Complex UIs should be built by composing simpler components
4. **Props Interface**: All components should have a clear and typed props interface
5. **Accessibility**: Components must follow accessibility standards

### Component Implementation Guidelines

#### Functional Components
Use functional components with hooks for state management:

```tsx
'use client'

import { useState, useEffect } from 'react'

interface UserProfileProps {
  userId: string;
  showAvatar?: boolean;
}

export function UserProfile({ userId, showAvatar = true }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (err) {
        setError('Failed to load user data');
        console.error('User fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!user) {
    return <div className="no-user">User not found</div>;
  }

  return (
    <div className="user-profile">
      {showAvatar && <img src={user.avatar} alt={user.name} />}
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

#### Props Validation
Use TypeScript interfaces for props validation:

```tsx
interface QuizOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function QuizOption({
  option,
  index,
  isSelected,
  isCorrect,
  isIncorrect,
  onSelect,
  disabled = false
}: QuizOptionProps) {
  // Component implementation
}
```

#### State Management
Use appropriate state management patterns:

```tsx
// Local state with useState
const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

// Complex state with useReducer
const [state, dispatch] = useReducer(quizReducer, initialState);

// Custom hooks for reusable logic
const { 
  revenueMetrics, 
  activeMultipliers, 
  getCurrentMultiplier 
} = useRevenueOptimization();
```

### Styling Guidelines
1. Use Tailwind CSS classes for styling
2. Follow the design system color palette and typography
3. Implement responsive design with mobile-first approach
4. Use the glass effect for card components
5. Create utility classes for repeated patterns

```css
/* Glass effect component */
.glass-effect {
  background: rgba(30, 60, 114, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Button components */
.button-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}
```

## 🎨 TypeScript Standards

### Type Definitions
Create type definitions in the `types/` directory:

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  level: number;
  totalQuizzes: number;
  correctAnswers: number;
  joinDate: string;
  quizHistory: QuizHistory[];
  streak: number;
}

export interface QuizHistory {
  categoryId: string;
  date: string;
  score: number;
  totalQuestions: number;
  coinsEarned: number;
}
```

### Interface vs Type
- Use `interface` for object shapes
- Use `type` for unions, primitives, or tuples

```typescript
// Interface for object shapes
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

// Type for unions
type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

// Type for primitives
type UserId = string;
```

### Generic Types
Use generics for reusable, type-safe functions:

```typescript
// Generic function for data fetching
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// Usage
interface User {
  id: string;
  name: string;
}

const user = await fetchData<User>('/api/user/123');
```

## ⚙️ Utility Functions

### Utility Function Structure
Utility functions should be pure, testable, and well-documented:

```typescript
// utils/rewardCalculator.ts

/**
 * Calculates the reward for a correct answer
 * @returns Object containing coins earned
 */
export function calculateCorrectAnswerReward(): { coins: number } {
  return { coins: 25 };
}

/**
 * Calculates the total reward for completing a quiz
 * @param correctAnswers - Number of correct answers
 * @param totalQuestions - Total number of questions
 * @returns Object containing total coins and bonus information
 */
export function calculateQuizReward(
  correctAnswers: number, 
  totalQuestions: number
): { totalCoins: number; bonus: number; multiplier: number } {
  const baseReward = correctAnswers * 25;
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  const accuracyBonus = accuracy >= 0.8 ? 50 : 0;
  const completionBonus = totalQuestions >= 5 ? 25 : 0;
  const totalCoins = baseReward + accuracyBonus + completionBonus;
  
  return {
    totalCoins,
    bonus: accuracyBonus + completionBonus,
    multiplier: 1
  };
}
```

### Error Handling
Implement consistent error handling patterns:

```typescript
// utils/api.ts
export async function apiCall<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json() as T;
  } catch (error) {
    // Log error for debugging
    console.error('API call failed:', error);
    
    // Report to error monitoring service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
    
    // Re-throw or return default value
    throw error;
  }
}
```

## 🧪 Testing Standards

### Test File Structure
Test files should be colocated with the code they test:

```
src/
├── components/
│   └── quiz/
│       ├── UnifiedQuizInterface.tsx
│       └── UnifiedQuizInterface.test.tsx
└── utils/
    ├── rewardCalculator.ts
    └── rewardCalculator.test.ts
```

### Unit Test Structure
Use Jest and React Testing Library for unit tests:

```tsx
// components/quiz/UnifiedQuizInterface.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UnifiedQuizInterface } from './UnifiedQuizInterface';

const mockQuestion = {
  id: '1',
  question: 'What is 2+2?',
  options: ['3', '4', '5', '6'],
  correct_answer: 1,
  difficulty: 'beginner',
  fun_fact: 'Fun fact here',
  category: 'math',
  subcategory: 'arithmetic'
};

const mockOnAnswerSelect = jest.fn();

describe('UnifiedQuizInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders question and options correctly', () => {
    render(
      <UnifiedQuizInterface
        question={mockQuestion}
        selectedAnswer={null}
        onAnswerSelect={mockOnAnswerSelect}
        questionAnswered={false}
        questionNumber={1}
        totalQuestions={5}
        showProgress={true}
        encouragementMessages={true}
        mode="default"
      />
    );

    expect(screen.getByText(mockQuestion.question)).toBeInTheDocument();
    mockQuestion.options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  test('calls onAnswerSelect when an option is clicked', () => {
    render(
      <UnifiedQuizInterface
        question={mockQuestion}
        selectedAnswer={null}
        onAnswerSelect={mockOnAnswerSelect}
        questionAnswered={false}
        questionNumber={1}
        totalQuestions={5}
        showProgress={true}
        encouragementMessages={true}
        mode="default"
      />
    );

    const firstOption = screen.getByText(mockQuestion.options[0]);
    fireEvent.click(firstOption);

    expect(mockOnAnswerSelect).toHaveBeenCalledWith(0);
  });
});
```

### Test Coverage Requirements
- Components with logic should have unit tests
- Utility functions should have comprehensive tests
- Edge cases should be covered
- Error conditions should be tested

## 🎭 Animation Implementation

### Framer Motion Usage
Use Framer Motion for performant animations:

```tsx
import { motion } from 'framer-motion';

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="glass-effect p-6 rounded-2xl"
    >
      {children}
    </motion.div>
  );
}
```

### CSS Animation Fallbacks
Provide CSS animation fallbacks for reduced motion preferences:

```tsx
import { useEffect, useState } from 'react';

export function QuizOption({ 
  option, 
  index, 
  isSelected, 
  isCorrect, 
  isIncorrect, 
  onSelect 
}: QuizOptionProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduceMotion(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const getAnimationClass = () => {
    if (reduceMotion) return '';
    if (isCorrect) return 'animate-correctAnswer';
    if (isIncorrect) return 'animate-shake';
    return '';
  };

  return (
    <div
      className={`quiz-option ${isSelected ? 'selected' : ''} ${getAnimationClass()}`}
      onClick={() => onSelect(index)}
    >
      {option}
    </div>
  );
}
```

## 📱 Responsive Design Implementation

### Mobile-First Approach
Implement responsive design with mobile-first CSS:

```css
/* Base mobile styles */
.quiz-option {
  padding: 12px 12px;
  min-height: 52px;
  font-size: 15px;
  border-radius: 16px;
}

/* Tablet and larger */
@media (min-width: 640px) {
  .quiz-option {
    padding: 14px 16px;
    min-height: 56px;
    font-size: 16px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .quiz-option {
    padding: 16px 20px;
    min-height: 60px;
    font-size: 18px;
    border-radius: 20px;
  }
}
```

### Conditional Rendering
Use conditional rendering for device-specific features:

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

## 🔧 Performance Optimization

### Code Splitting
Use dynamic imports for code splitting:

```tsx
import dynamic from 'next/dynamic';

const UnifiedQuizInterface = dynamic(
  () => import('../components/quiz/UnifiedQuizInterface').then(mod => mod.UnifiedQuizInterface),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-800/50 rounded-xl animate-pulse" />
  }
);
```

### Memoization
Use React.memo and useMemo for performance optimization:

```tsx
import { memo, useMemo } from 'react';

interface CategoryCardProps {
  category: Category;
  onSelect: (categoryId: string) => void;
  userCoins: number;
}

export const CategoryCard = memo(function CategoryCard({ 
  category, 
  onSelect, 
  userCoins 
}: CategoryCardProps) {
  const canAfford = useMemo(() => userCoins >= category.entry_fee, [userCoins, category.entry_fee]);
  
  const prizePool = useMemo(() => {
    // Expensive calculation
    return calculatePrizePool(category.id, category.difficulty);
  }, [category.id, category.difficulty]);

  return (
    <div 
      className="category-card"
      onClick={() => canAfford && onSelect(category.id)}
    >
      {/* Card content */}
    </div>
  );
});
```

### Lazy Loading
Implement lazy loading for non-critical resources:

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('../components/HeavyComponent'));

export function Page() {
  return (
    <div>
      <MainContent />
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

## 🛡️ Security Best Practices

### Input Validation
Validate all user inputs:

```typescript
// utils/validation.ts
export function validateUsername(username: string): boolean {
  // Check length
  if (username.length < 3 || username.length > 20) {
    return false;
  }
  
  // Check for valid characters
  const validChars = /^[a-zA-Z0-9_]+$/;
  if (!validChars.test(username)) {
    return false;
  }
  
  // Check for reserved words
  const reservedWords = ['admin', 'root', 'system'];
  if (reservedWords.includes(username.toLowerCase())) {
    return false;
  }
  
  return true;
}
```

### Secure Data Handling
Handle sensitive data securely:

```typescript
// utils/auth.ts
export function saveUser(user: User) {
  // Remove sensitive data before saving
  const { ...safeUser } = user;
  delete (safeUser as any).password;
  
  try {
    localStorage.setItem('user', JSON.stringify(safeUser));
  } catch (error) {
    console.error('Failed to save user data:', error);
    // Report to error monitoring
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }
}
```

## 📚 Documentation Standards

### Code Comments
Write clear, concise comments:

```typescript
/**
 * Calculates the reward for completing a quiz
 * @param correctAnswers - Number of questions answered correctly
 * @param totalQuestions - Total number of questions in the quiz
 * @returns Object containing total coins earned and bonus information
 */
export function calculateQuizReward(
  correctAnswers: number, 
  totalQuestions: number
): { totalCoins: number; bonus: number; multiplier: number } {
  // Base reward calculation
  const baseReward = correctAnswers * 25;
  
  // Accuracy bonus for 80%+ correct answers
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  const accuracyBonus = accuracy >= 0.8 ? 50 : 0;
  
  // Completion bonus for quizzes with 5+ questions
  const completionBonus = totalQuestions >= 5 ? 25 : 0;
  
  // Total calculation
  const totalCoins = baseReward + accuracyBonus + completionBonus;
  
  return {
    totalCoins,
    bonus: accuracyBonus + completionBonus,
    multiplier: 1
  };
}
```

### Component Documentation
Document component props and usage:

```tsx
/**
 * QuizOption Component
 * 
 * A selectable option in a quiz question.
 * 
 * @param option - The text content of the option
 * @param index - The index of the option (0-3)
 * @param isSelected - Whether this option is currently selected
 * @param isCorrect - Whether this option is the correct answer (after selection)
 * @param isIncorrect - Whether this option is incorrect (after selection)
 * @param onSelect - Callback function when option is selected
 * @param disabled - Whether the option is disabled
 * 
 * @example
 * ```tsx
 * <QuizOption
 *   option="Paris"
 *   index={0}
 *   isSelected={false}
 *   onSelect={(index) => console.log(`Selected option ${index}`)}
 * />
 * ```
 */
export function QuizOption({
  option,
  index,
  isSelected,
  isCorrect,
  isIncorrect,
  onSelect,
  disabled = false
}: QuizOptionProps) {
  // Component implementation
}
```

## ✅ Code Review Guidelines

### Review Checklist
Before merging code, ensure:

#### Functionality
- [ ] Code meets requirements
- [ ] Edge cases are handled
- [ ] Error conditions are managed
- [ ] Performance is acceptable

#### Code Quality
- [ ] Code follows established patterns
- [ ] Naming is clear and consistent
- [ ] Comments explain complex logic
- [ ] No unnecessary complexity

#### Testing
- [ ] Unit tests cover functionality
- [ ] Edge cases are tested
- [ ] Error conditions are tested
- [ ] Test coverage is adequate

#### Security
- [ ] Input validation is implemented
- [ ] Sensitive data is handled securely
- [ ] Authentication/authorization is correct
- [ ] No security vulnerabilities

#### Documentation
- [ ] Code is properly commented
- [ ] Component documentation is updated
- [ ] README files are updated if needed
- [ ] Design system compliance is maintained

## 🔄 Update Process

### Adding New Features
1. Create feature branch from main
2. Implement feature following coding standards
3. Add comprehensive tests
4. Update documentation
5. Create pull request with detailed description
6. Address code review feedback
7. Merge after approval

### Modifying Existing Code
1. Understand existing implementation
2. Make minimal, focused changes
3. Update tests if functionality changes
4. Update documentation if interfaces change
5. Verify no regressions in existing functionality
6. Follow code review process

### Refactoring
1. Identify areas for improvement
2. Create refactoring plan
3. Make changes in small, testable increments
4. Maintain functionality during refactoring
5. Update tests and documentation
6. Verify performance is not degraded

## 📚 References

- **Design System**: [docs/DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- **Website Design Standards**: [docs/website-standards/WEBSITE_DESIGN_STANDARDS.md](../website-standards/WEBSITE_DESIGN_STANDARDS.md)
- **Component Organization**: [docs/architecture/COMPONENT_ORGANIZATION.md](../architecture/COMPONENT_ORGANIZATION.md)
- **UI Component Standards**: [docs/components/UI_COMPONENT_STANDARDS.md](../components/UI_COMPONENT_STANDARDS.md)
- **Accessibility Standards**: [docs/accessibility/ACCESSIBILITY_STANDARDS.md](../accessibility/ACCESSIBILITY_STANDARDS.md)
- **Visual Regression Testing**: [docs/testing/VISUAL_REGRESSION_TESTING.md](../testing/VISUAL_REGRESSION_TESTING.md)
- **Project README**: [README.md](../../README.md)