# 🚨 Sentry Error Monitoring Setup Guide

This guide will help you set up Sentry error monitoring for TechKwiz v8.

## 📋 Prerequisites

- Sentry account (free at [sentry.io](https://sentry.io))
- TechKwiz v8 project with Sentry already installed

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Sentry Account & Project

1. **Sign up** at [sentry.io](https://sentry.io) (free account)
2. **Create a new project**:
   - Platform: **Next.js**
   - Project name: **techkwiz-v8**
   - Team: Use default or create new

### Step 2: Get Your DSN

1. After creating the project, copy your **DSN** (Data Source Name)
2. It looks like: `https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxxxx.ingest.sentry.io/xxxxxxx`

### Step 3: Configure Environment Variables

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your Sentry DSN** to `.env.local`:
   ```bash
   # Sentry Configuration
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@sentry.io/project-id
   
   # Optional: For source maps upload (production)
   SENTRY_ORG=your-org-name
   SENTRY_PROJECT=techkwiz-v8
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

### Step 4: Test the Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Trigger a test error** (optional):
   - Add this to any page temporarily:
   ```javascript
   // Test error - remove after testing
   throw new Error("Test Sentry integration");
   ```

3. **Check Sentry dashboard** for the error

## 🔧 Advanced Configuration

### Source Maps Upload (Production)

For better error tracking in production:

1. **Get Auth Token**:
   - Go to Sentry → Settings → Auth Tokens
   - Create token with `project:releases` scope

2. **Add to environment**:
   ```bash
   SENTRY_AUTH_TOKEN=your-auth-token-here
   ```

### Custom Error Reporting

Use the built-in error reporting utilities:

```javascript
import { ErrorReporter } from '@/utils/errorReporting'

// Report quiz errors
ErrorReporter.reportQuizError(error, {
  questionId: 'q123',
  category: 'programming',
  userId: 'user456'
})

// Report authentication errors
ErrorReporter.reportAuthError(error, {
  action: 'login',
  userId: 'user456'
})

// Track user actions
ErrorReporter.trackUserAction('quiz_started', {
  category: 'programming'
})
```

## 📊 Monitoring & Alerts

### Set Up Alerts

1. **Go to Sentry → Alerts**
2. **Create alert rule**:
   - Trigger: When error count > 5 in 1 minute
   - Action: Send email notification

### Performance Monitoring

Sentry automatically tracks:
- Page load times
- API response times
- User interactions
- Core Web Vitals

## 🆓 Free Tier Limits

- **5,000 errors/month** (plenty for development)
- **1 project**
- **30-day retention**
- **Basic performance monitoring**

## 🔍 Debugging Tips

### Development Mode
- Errors are logged to console AND Sentry
- Check browser console for immediate feedback
- Sentry dashboard for detailed analysis

### Production Mode
- Only critical errors sent to Sentry
- Source maps help identify exact code location
- User context automatically captured

## 🚨 Common Issues

### DSN Not Working
- Check DSN format in `.env.local`
- Ensure `NEXT_PUBLIC_` prefix is used
- Restart development server after changes

### No Errors Appearing
- Check Sentry project settings
- Verify DSN is correct
- Test with a manual error throw

### Source Maps Missing
- Add `SENTRY_AUTH_TOKEN` to environment
- Ensure `SENTRY_ORG` and `SENTRY_PROJECT` are set
- Check build logs for upload confirmation

## 📈 What Gets Tracked

### Automatic Tracking
- JavaScript errors and exceptions
- Unhandled promise rejections
- Performance metrics
- User sessions and page views

### Manual Tracking
- Quiz-specific errors
- Authentication issues
- Reward system problems
- User feedback and reports

## 🎯 Next Steps

1. **Monitor for 1 week** to establish baseline
2. **Set up alerts** for critical errors
3. **Review error patterns** weekly
4. **Consider upgrading** if you exceed free tier

---

**Need Help?** Check the [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/) or create an issue in the project repository.
