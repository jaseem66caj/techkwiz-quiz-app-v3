# TechKwiz UI Component Standards

**Version 1.0** | **Last Updated:** September 14, 2025 | **Maintained by:** TechKwiz Development Team

## 🎯 Overview

This document defines the standards and specifications for all UI components in the TechKwiz Quiz App. It provides detailed guidelines for component design, implementation, and usage to ensure consistency and quality across the application.

## 🎨 Visual Components

### Buttons

#### Primary Button
**Purpose**: Main call-to-action buttons
**Usage**: Primary actions like "Play", "Submit", "Continue"
**Implementation**:
```tsx
// File: src/app/globals.css
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

.button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}
```

**Props**:
- `children`: Button text/content
- `onClick`: Click handler function
- `disabled`: Boolean to disable button
- `className`: Additional CSS classes

**Accessibility**:
- Must have proper contrast ratio (≥ 4.5:1)
- Must be focusable via keyboard
- Should have descriptive aria-label if icon-only

#### Secondary Button
**Purpose**: Secondary actions and alternative options
**Usage**: Secondary actions like "Back", "Cancel", "View Details"
**Implementation**:
```tsx
// File: src/app/globals.css
.button-secondary {
  background: rgba(42, 82, 152, 0.8);
  border: 2px solid transparent;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.button-secondary:hover {
  background: rgba(42, 82, 152, 1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
```

**Props**:
- `children`: Button text/content
- `onClick`: Click handler function
- `disabled`: Boolean to disable button
- `className`: Additional CSS classes

### Cards

#### Glass Effect Card
**Purpose**: Main container for content sections
**Usage**: Category cards, quiz interfaces, modals
**Implementation**:
```tsx
// File: src/app/globals.css
.glass-effect {
  background: rgba(30, 60, 114, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

**Props**:
- `children`: Card content
- `className`: Additional CSS classes
- `onClick`: Optional click handler

**Example Usage**:
```tsx
<div className="glass-effect p-6 rounded-2xl">
  <h3 className="text-xl font-bold text-white mb-4">Card Title</h3>
  <p className="text-blue-200">Card content goes here</p>
</div>
```

### Quiz Options

#### Default Quiz Option
**Purpose**: Interactive answer options for quizzes
**Usage**: Multiple choice answers in quiz interface
**Implementation**:
```tsx
// File: src/app/globals.css
.quiz-option {
  background: rgba(42, 82, 152, 0.8);
  border: 2px solid transparent;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  padding: 12px 12px;
  text-align: center;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 1.4;
  width: 100%;
}

/* Mobile-specific improvements */
@media (max-width: 640px) {
  .quiz-option {
    padding: 12px 8px;
    min-height: 48px;
    font-size: 14px;
    border-radius: 20px;
    font-weight: 800;
  }
}
```

#### Quiz Option States

**Selected State**:
```tsx
// File: src/app/globals.css
.quiz-option.selected {
  background: rgba(255, 193, 7, 0.8);
  border-color: #ffc107;
  transform: scale(1.05);
}
```

**Correct State**:
```tsx
// File: src/app/globals.css
.quiz-option.correct {
  background: rgba(40, 167, 69, 0.8);
  border-color: #28a745;
  animation: correctAnswer 0.6s ease;
}

@keyframes correctAnswer {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1.05); }
}
```

**Incorrect State**:
```tsx
// File: src/app/globals.css
.quiz-option.incorrect {
  background: rgba(220, 53, 69, 0.8);
  border-color: #dc3545;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

## 🧭 Navigation Components

### Unified Navigation
**Purpose**: Main navigation bar with responsive behavior
**Location**: `src/components/navigation/UnifiedNavigation.tsx`
**Modes**:
1. **Full Mode** (default): Complete navigation with all features
2. **Simple Mode**: Logo and basic navigation links
3. **Minimal Mode**: Logo only

**Props**:
- `hideHeaderElements`: Boolean to hide user info bar
- `mode`: 'full' | 'simple' | 'minimal'

**Implementation Details**:
- Uses Framer Motion for smooth animations
- Responsive design with mobile menu for small screens
- Displays coin balance for authenticated users
- Shows user info and logout option when authenticated

**Navigation Items**:
- Home (`/`)
- Categories (`/start`)
- Leaderboard (`/leaderboard`)
- Profile (`/profile`)

### Mobile Menu
**Purpose**: Collapsible menu for mobile devices
**Implementation**:
- Uses Framer Motion for slide animation
- Contains all main navigation links
- Closes automatically when link is clicked

## 🎮 Quiz Components

### Unified Quiz Interface
**Purpose**: Main quiz interface component
**Location**: `src/components/quiz/UnifiedQuizInterface.tsx`
**Props**:
- `question`: Current question object
- `selectedAnswer`: Index of selected answer
- `onAnswerSelect`: Function to handle answer selection
- `questionAnswered`: Boolean indicating if question is answered
- `questionNumber`: Current question number
- `totalQuestions`: Total number of questions
- `showProgress`: Boolean to show progress bar
- `encouragementMessages`: Boolean to show encouragement messages
- `mode`: 'default' | 'enhanced'

**Features**:
- Progress bar
- Question display
- Answer options with feedback
- Timer integration
- Encouragement messages

### Countdown Timer
**Purpose**: Timer for quiz questions
**Location**: `src/components/quiz/CountdownTimer.tsx`
**Props**:
- `initialTime`: Initial time in seconds
- `onTimeUp`: Function called when time expires
- `isPaused`: Boolean to pause timer
- `onPause`: Function called when timer pauses
- `onResume`: Function called when timer resumes

**Features**:
- Visual progress bar
- Time display
- Pause/resume functionality
- Time-up callback

### Quiz Results Display
**Purpose**: Display quiz results and rewards
**Location**: `src/components/quiz/QuizResultsDisplay.tsx`
**Props**:
- `score`: Number of correct answers
- `totalQuestions`: Total number of questions
- `coinsEarned`: Coins earned from quiz
- `onContinue`: Function to continue to next step
- `timeRemaining`: Time remaining for auto-redirect

**Features**:
- Score display
- Coin earnings display
- Continue button
- Auto-redirect timer

## 👤 User Components

### Create Profile
**Purpose**: Profile creation form
**Location**: `src/components/user/CreateProfile.tsx`
**Props**:
- `onCreateProfile`: Function called when profile is created
- `onClose`: Function called to close the form

**Features**:
- Username input field
- Avatar selection
- Form validation
- Submit button

### Avatar Selector
**Purpose**: Modal for selecting user avatar
**Location**: `src/components/user/AvatarSelector.tsx`
**Props**:
- `onSelect`: Function called when avatar is selected
- `onClose`: Function called to close the modal
- `selectedAvatar`: Currently selected avatar ID

**Features**:
- Grid of avatar options
- Preview of selected avatar
- Selection confirmation

### Achievement Notification
**Purpose**: Toast notification for unlocked achievements
**Location**: `src/components/user/AchievementNotification.tsx`
**Props**:
- `achievement`: Achievement object
- `isVisible`: Boolean to show notification
- `onClose`: Function called to close notification

**Features**:
- Animated entrance/exit
- Achievement details display
- Close button

## 🪙 Reward Components

### Reward Celebration Animation
**Purpose**: Visual celebration for earning rewards
**Location**: `src/components/rewards/RewardCelebrationAnimation.tsx`
**Props**:
- `isVisible`: Boolean to show animation
- `coinsEarned`: Number of coins earned
- `onAnimationComplete`: Function called when animation completes

**Features**:
- Coin animation
- Confetti effect
- Coin count display

### Unified Reward Popup
**Purpose**: Popup for displaying rewards
**Location**: `src/components/rewards/UnifiedRewardPopup.tsx`
**Props**:
- `isVisible`: Boolean to show popup
- `reward`: Reward object
- `onClose`: Function called to close popup

**Features**:
- Reward details display
- Close button
- Auto-close timer

## 📱 UI Components

### Category Card
**Purpose**: Display for quiz categories
**Location**: `src/components/ui/CategoryCard.tsx`
**Props**:
- `category`: Category object
- `onSelect`: Function called when card is selected
- `userCoins`: User's current coin balance

**Features**:
- Category icon and name
- Description
- Subcategories display
- Entry fee and prize pool
- Play button (disabled if insufficient coins)

### Enhanced Coin Display
**Purpose**: Display of user's coin balance
**Location**: `src/components/ui/EnhancedCoinDisplay.tsx`
**Props**:
- `coins`: Number of coins to display
- `className`: Additional CSS classes

**Features**:
- Animated coin icon
- Coin count display
- Styling consistent with design system

### Streak Multiplier Display
**Purpose**: Display of user's streak multiplier
**Location**: `src/components/ui/StreakMultiplierDisplay.tsx`
**Props**:
- `currentStreak`: Current streak count
- `multiplier`: Current multiplier value
- `isActive`: Boolean indicating if multiplier is active
- `position`: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

**Features**:
- Streak count display
- Multiplier value display
- Positioning options
- Active state styling

## 🪟 Modal Components

### Exit Confirmation Modal
**Purpose**: Confirm user's intent to exit quiz
**Location**: `src/components/modals/ExitConfirmationModal.tsx`
**Props**:
- `isOpen`: Boolean to show modal
- `onConfirm`: Function called when user confirms exit
- `onCancel`: Function called when user cancels exit
- `currentProgress`: Object with current quiz progress

**Features**:
- Progress information display
- Confirm and cancel buttons
- Coins at risk warning

### Auth Modal
**Purpose**: Authentication interface
**Location**: `src/components/modals/AuthModal.tsx`
**Props**:
- `isOpen`: Boolean to show modal
- `onClose`: Function called to close modal
- `onSuccess`: Function called on successful authentication

**Features**:
- Login/signup tabs
- Form validation
- Error handling
- Demo mode information

## 📊 Analytics Components

### Google Analytics
**Purpose**: Google Analytics integration
**Location**: `src/components/analytics/GoogleAnalytics.tsx`
**Features**:
- Page view tracking
- Event tracking
- User property tracking

## 📈 Data Components

### News Section
**Purpose**: Display of news/updates
**Location**: `src/components/ui/NewsSection.tsx`
**Features**:
- News article display
- Loading states
- Error handling

### Fortune Cookie
**Purpose**: Display of fun facts
**Location**: `src/components/ui/FortuneCookie.tsx`
**Features**:
- Fun fact display
- Loading states
- Error handling

## 🎯 Component Design Guidelines

### Consistency
- All components must follow the design system color palette
- Typography must be consistent with design system specifications
- Spacing must follow the 4px grid system
- Animations must use Framer Motion or predefined CSS keyframes

### Responsiveness
- All components must be mobile-first
- Components must adapt to different screen sizes
- Touch targets must be minimum 44px
- Text must be readable on all devices

### Accessibility
- All interactive components must be keyboard accessible
- Proper ARIA attributes must be used
- Color contrast must meet WCAG 2.1 AA standards
- Semantic HTML must be used where appropriate

### Performance
- Components should minimize re-renders
- Heavy components should use dynamic imports
- Animations should be optimized for performance
- Bundle size should be considered

## ✅ Component Testing Standards

### Visual Regression Testing
- All components must have visual regression tests
- Tests must cover all states (default, hover, active, disabled)
- Tests must cover responsive breakpoints
- Baseline images must be updated when component changes are intentional

### Unit Testing
- Components with logic must have unit tests
- Props validation must be tested
- Event handlers must be tested
- Edge cases must be covered

### Integration Testing
- Component interactions must be tested
- State management must be tested
- API integrations must be tested

## 🔄 Component Update Process

### Adding New Components
1. Create component in appropriate directory
2. Follow naming and structure conventions
3. Implement design system compliance
4. Add to component documentation
5. Create visual regression tests
6. Add unit tests if applicable

### Modifying Existing Components
1. Update component implementation
2. Update documentation
3. Update visual regression tests
4. Update unit tests if applicable
5. Verify cross-component compatibility

## 📚 References

- **Website Design Standards**: [docs/website-standards/WEBSITE_DESIGN_STANDARDS.md](../website-standards/WEBSITE_DESIGN_STANDARDS.md)
- **Component Organization**: [docs/architecture/COMPONENT_ORGANIZATION.md](../architecture/COMPONENT_ORGANIZATION.md)
- **Design System**: [docs/DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- **Global Styles**: [src/app/globals.css](../../src/app/globals.css)