# 🔧 Admin Dashboard Maintenance Guide

## Route Migration History

### Migration Summary (December 2024)
- **From**: Multiple legacy routes (`/admin`, `/jaseem`)
- **To**: Single consolidated route (`/jaseemadmin`)
- **Rationale**: Security enhancement, route consolidation, and elimination of confusion

### Legacy Routes (REMOVED)
- `/admin` - Original admin route, removed for security reasons
- `/jaseem` - Redundant route, removed during consolidation
- **Current Status**: Both routes return 404 errors

### Current Route Structure
- **Primary Route**: `/jaseemadmin`
- **Authentication**: Required for all access
- **Navigation**: Hash-based routing for admin sections
- **Security**: Session-based with configurable timeout

## Authentication System Overview

### Current Implementation
- **File**: `frontend/src/utils/adminAuth.ts`
- **Hook**: `frontend/src/hooks/useAdminAuth.ts`
- **Component**: `frontend/src/components/admin/AdminLogin.tsx`

### Password Management
- **Environment Variable**: `NEXT_PUBLIC_ADMIN_PASSWORD_HASH`
- **Default Development Password**: `TechKwiz2024!Admin`
- **Hashing**: Simple hash function for password verification
- **Storage**: Session data stored in localStorage with timeout

### Security Features
- **Session Timeout**: 30 minutes of inactivity
- **Failed Attempt Blocking**: 5 attempts, 15-minute lockout
- **Activity Logging**: All admin actions logged
- **Permission Validation**: Required for sensitive operations

## Component Architecture

### Core Components
1. **AdminDashboardV2** (`frontend/src/components/admin/v2/AdminDashboardV2.tsx`)
   - Main dashboard container
   - Handles navigation state
   - Manages section rendering

2. **AdminNavigationV2** (`frontend/src/components/admin/v2/AdminNavigationV2.tsx`)
   - Sidebar navigation
   - Hash-based routing
   - Section indicators

3. **AdminContentV2** (`frontend/src/components/admin/v2/AdminContentV2.tsx`)
   - Dynamic content rendering
   - Section-specific components
   - Loading states

### Section Components
- **Dashboard**: Overview and quick actions
- **QuizManagement**: CRUD operations for questions
- **RewardedPopupConfig**: Coin values and popup settings
- **AnalyticsSection**: Performance metrics
- **SettingsSection**: System configuration
- **FileManagement**: File editors (ads.txt, robots.txt, llms.txt)

## Adding New Admin Sections

### Step 1: Define Section Type
```typescript
// In frontend/src/types/admin.ts
export type AdminSectionId = 
  | 'dashboard' 
  | 'quiz-management' 
  | 'reward-config' 
  | 'analytics' 
  | 'settings' 
  | 'file-management'
  | 'your-new-section' // Add here
```

### Step 2: Create Section Component
```typescript
// frontend/src/components/admin/v2/sections/YourNewSection.tsx
export function YourNewSection() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Your New Section</h1>
      {/* Your content here */}
    </div>
  )
}
```

### Step 3: Add Navigation Entry
```typescript
// In AdminNavigationV2.tsx
const sections: AdminSection[] = [
  // ... existing sections
  {
    id: 'your-new-section',
    name: 'Your New Section',
    icon: YourIcon,
    badge: undefined
  }
]
```

### Step 4: Register in Content Router
```typescript
// In AdminContentV2.tsx
const renderSection = () => {
  switch (currentSection) {
    // ... existing cases
    case 'your-new-section':
      return <YourNewSection />
    default:
      return <DashboardSection />
  }
}
```

## localStorage Data Structures

### Admin Session
```typescript
interface AdminSession {
  isAuthenticated: boolean
  loginTime: number
  lastActivity: number
  sessionId: string
}
```

### Quiz Data
```typescript
interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: 'regular' | 'bonus'
}
```

### Reward Configuration
```typescript
interface RewardConfig {
  correctAnswerCoins: number
  incorrectAnswerCoins: number
  bonusQuestionCoins: number
  streakMultiplier: number
  achievements: Achievement[]
  popupSettings: PopupSettings
}
```

## Troubleshooting Guide

### Common Issues

#### 1. Authentication Not Working
- **Check**: Environment variable `NEXT_PUBLIC_ADMIN_PASSWORD_HASH`
- **Verify**: Password matches exactly (case-sensitive)
- **Clear**: localStorage data if corrupted
- **Reset**: Failed attempt counter in localStorage

#### 2. Hash Navigation Not Working
- **Check**: URL format `/jaseemadmin#section-name`
- **Verify**: Section ID exists in AdminSectionId type
- **Debug**: Console logs in AdminNavigationV2

#### 3. Data Not Persisting
- **Check**: localStorage quota not exceeded
- **Verify**: JSON serialization working correctly
- **Clear**: Corrupted localStorage entries
- **Test**: Browser localStorage support

#### 4. Build Errors
- **Check**: TypeScript interfaces match data structures
- **Verify**: All imports resolve correctly
- **Run**: `npm run build` to identify issues
- **Fix**: Type mismatches and missing dependencies

### Debug Commands
```bash
# Check build status
npm run build

# Run development server
npm run dev

# Check TypeScript errors
npx tsc --noEmit

# Clear Next.js cache
rm -rf .next
```

## Security Considerations

### Best Practices
1. **Never commit passwords** to version control
2. **Use environment variables** for sensitive data
3. **Implement proper session management** with timeouts
4. **Log admin activities** for audit trails
5. **Validate permissions** before sensitive operations

### Production Deployment
1. **Change default password** from development value
2. **Use HTTPS** for all admin access
3. **Configure proper CSP headers** for security
4. **Monitor admin access logs** for suspicious activity
5. **Regular security updates** for dependencies

## Performance Optimization

### Component Patterns
- **Use React.memo** for expensive components
- **Implement useCallback** for stable function references
- **Lazy load** admin sections with React.lazy
- **Optimize re-renders** with proper dependency arrays

### Data Management
- **Batch localStorage operations** to reduce I/O
- **Implement data validation** before storage
- **Use compression** for large data sets
- **Cache frequently accessed** data in memory

## Maintenance Checklist

### Monthly Tasks
- [ ] Review admin access logs
- [ ] Update dependencies
- [ ] Check localStorage usage
- [ ] Verify backup procedures

### Quarterly Tasks
- [ ] Security audit of admin components
- [ ] Performance review and optimization
- [ ] Documentation updates
- [ ] User feedback integration

### Annual Tasks
- [ ] Password policy review
- [ ] Architecture assessment
- [ ] Technology stack updates
- [ ] Comprehensive testing
