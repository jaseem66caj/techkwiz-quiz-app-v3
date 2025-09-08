# 🚀 GitHub Deployment Guide for TechKwiz v8

This guide explains how to deploy TechKwiz v8 with Sentry error monitoring using GitHub Actions.

## 📋 Prerequisites

- GitHub repository with admin access
- Sentry account and project setup
- Google Analytics account (optional)
- Hosting provider account

## 🔐 Required GitHub Secrets

### **Essential Secrets**

Navigate to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

#### **1. NEXT_PUBLIC_SENTRY_DSN** (Required for Error Monitoring)
- **Value**: Your Sentry DSN from Sentry project settings
- **Format**: `https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxxxx.ingest.sentry.io/xxxxxxx`
- **How to get**: Sentry Dashboard → Project Settings → Client Keys (DSN)

#### **2. NEXT_PUBLIC_APP_URL** (Optional)
- **Value**: Your production domain
- **Default**: `https://play.techkwiz.com`
- **Example**: `https://yourdomain.com`

### **Optional Secrets**

#### **3. NEXT_PUBLIC_ANALYTICS_ID** (Optional - Google Analytics)
- **Value**: Your Google Analytics Measurement ID
- **Format**: `G-XXXXXXXXXX`
- **How to get**: Google Analytics → Admin → Data Streams → Measurement ID

#### **4. SENTRY_ORG** (Optional - Source Maps)
- **Value**: Your Sentry organization slug
- **Example**: `your-org-name`
- **Benefit**: Enables source map upload for better error debugging

#### **5. SENTRY_PROJECT** (Optional - Source Maps)
- **Value**: Your Sentry project slug
- **Example**: `techkwiz-v8`
- **Benefit**: Enables source map upload for better error debugging

#### **6. SENTRY_AUTH_TOKEN** (Optional - Source Maps)
- **Value**: Sentry authentication token
- **How to get**: Sentry → Settings → Auth Tokens → Create Token
- **Scopes needed**: `project:releases`, `org:read`
- **Benefit**: Enables automatic source map upload

## 🔧 Setting Up GitHub Secrets

### Step-by-Step Instructions

1. **Go to Repository Settings**
   ```
   GitHub Repository → Settings → Secrets and variables → Actions
   ```

2. **Add Required Secrets**
   ```
   Click "New repository secret" for each:
   
   Name: NEXT_PUBLIC_SENTRY_DSN
   Value: https://your-sentry-dsn@sentry.io/project-id
   
   Name: NEXT_PUBLIC_APP_URL
   Value: https://yourdomain.com
   
   Name: NEXT_PUBLIC_ANALYTICS_ID
   Value: G-XXXXXXXXXX
   ```

3. **Add Optional Sentry Secrets** (for source maps)
   ```
   Name: SENTRY_ORG
   Value: your-org-slug
   
   Name: SENTRY_PROJECT
   Value: techkwiz-v8
   
   Name: SENTRY_AUTH_TOKEN
   Value: your-sentry-auth-token
   ```

## 🚀 Deployment Process

### Automatic Deployment

The deployment happens automatically when you push to the `main` branch:

```bash
git push origin main
```

### Manual Deployment

You can also trigger deployment manually:

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy TechKwiz to Production** workflow
3. Click **Run workflow** → **Run workflow**

## 📊 Deployment Workflow

### What Happens During Deployment

1. **Environment Setup**
   - Node.js 18 installation
   - Dependencies installation
   - Environment variables configuration

2. **Build Process**
   - Next.js production build
   - Static page generation
   - Bundle optimization
   - Sentry integration

3. **Verification**
   - Build artifact validation
   - Sentry configuration check
   - File structure verification

4. **Artifact Generation**
   - Build files packaging
   - Deployment report creation
   - Artifact upload to GitHub

## 📦 Manual Deployment Steps

After GitHub Actions completes:

### 1. Download Build Artifacts

1. Go to **Actions** tab → Latest workflow run
2. Scroll down to **Artifacts** section
3. Download `techkwiz-v8-build-[commit-hash]`
4. Extract the downloaded ZIP file

### 2. Upload to Hosting Provider

Upload these files to your hosting provider:
- `.next/` directory (entire folder)
- `public/` directory (entire folder)
- `package.json`
- `next.config.js`

### 3. Configure Hosting Environment

Set these environment variables on your hosting platform:

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_ENABLE_TEST_PAGES=false
```

### 4. Start the Application

Most hosting providers will automatically detect and run:
```bash
npm start
```

## 🔍 Verification

### Post-Deployment Checklist

- [ ] **Site loads correctly** at your domain
- [ ] **Error monitoring works** (check Sentry dashboard)
- [ ] **Analytics tracking** (check Google Analytics)
- [ ] **All pages accessible** (/, /start, /quiz/*, /profile, etc.)
- [ ] **Test pages blocked** (/test-* routes should redirect)
- [ ] **Mobile responsiveness** works
- [ ] **Performance** is acceptable

### Testing Error Monitoring

1. **Trigger a test error** (temporarily):
   ```javascript
   // Add to any page component temporarily
   throw new Error("Test Sentry integration - remove after testing");
   ```

2. **Check Sentry dashboard** for the error
3. **Remove the test error** after verification

## 🚨 Troubleshooting

### Common Issues

#### **Build Fails**
- Check if all required secrets are set
- Verify Sentry DSN format is correct
- Check GitHub Actions logs for specific errors

#### **Sentry Not Working**
- Verify `NEXT_PUBLIC_SENTRY_DSN` is set correctly
- Check Sentry project settings
- Ensure DSN has `NEXT_PUBLIC_` prefix

#### **Analytics Not Tracking**
- Verify `NEXT_PUBLIC_ANALYTICS_ID` format (G-XXXXXXXXXX)
- Check Google Analytics property settings
- Allow 24-48 hours for data to appear

#### **Environment Variables Not Working**
- Ensure secrets have `NEXT_PUBLIC_` prefix for client-side variables
- Restart hosting service after adding environment variables
- Check hosting provider's environment variable documentation

## 📞 Support

### Getting Help

1. **Check GitHub Actions logs** for build errors
2. **Review Sentry documentation** for integration issues
3. **Consult hosting provider docs** for deployment specifics
4. **Create GitHub issue** for application-specific problems

### Useful Links

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Ready to deploy?** Follow this guide step by step, and your TechKwiz v8 application with comprehensive error monitoring will be live! 🎉
