# 🔧 Environment Variables Setup Guide

This guide provides step-by-step instructions for configuring production environment variables for TechKwiz-v7.

## 📋 Required Environment Variables

### 1. Google Analytics 4 (GA4) Setup

**Variable:** `NEXT_PUBLIC_ANALYTICS_ID`  
**Format:** `G-XXXXXXXXXX`

**How to get your GA4 Measurement ID:**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **Admin** (gear icon) in the bottom left
4. In the **Property** column, click **Data Streams**
5. Click on your web stream (or create one if none exists)
6. Copy the **Measurement ID** (starts with `G-`)

**Example:** `NEXT_PUBLIC_ANALYTICS_ID=G-ABC123DEF4`

### 2. Google Tag Manager (GTM) Setup

**Variable:** `NEXT_PUBLIC_GTM_ID`  
**Format:** `GTM-XXXXXXX`

**How to get your GTM Container ID:**

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Sign in with your Google account
3. Create a new container or select existing one
4. The Container ID is displayed at the top (starts with `GTM-`)

**Example:** `NEXT_PUBLIC_GTM_ID=GTM-ABC123D`

### 3. Google AdSense Setup

**Variable:** `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`  
**Format:** `ca-pub-xxxxxxxxxxxxxxxx`

**How to get your AdSense Publisher ID:**

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign in with your Google account
3. Click **Account** in the left sidebar
4. Click **Account information**
5. Copy your **Publisher ID** (starts with `ca-pub-`)

**Example:** `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-1234567890123456`

### 4. Admin Authentication Setup

**Variable:** `NEXT_PUBLIC_ADMIN_PASSWORD_HASH`
**Format:** `TechKwiz2024!Admin` (case-sensitive)

**Admin Panel Configuration:**

1. **Default Password**: `TechKwiz2024!Admin`
2. **Admin URL**: `https://yourdomain.com/jaseem`
3. **Security**: Change password for production use
4. **Access**: Requires HTTPS in production

**Example:** `NEXT_PUBLIC_ADMIN_PASSWORD_HASH=TechKwiz2024!Admin`

### 5. Production Domain Setup

**Variable:** `NEXT_PUBLIC_APP_URL`
**Format:** `https://yourdomain.com` (no trailing slash)

**How to set your production domain:**

1. Use your Hostinger domain (e.g., `https://yourdomain.com`)
2. Or use a custom domain if configured
3. Always use `https://` for production
4. Do NOT include trailing slash

**Example:** `NEXT_PUBLIC_APP_URL=https://techkwiz.live`

## 🚀 Deployment Steps

### Step 1: Update Local Environment File

1. Open `frontend/.env` in your editor
2. Replace the placeholder values with your actual IDs:
   ```bash
   # Admin Configuration
   NEXT_PUBLIC_ADMIN_PASSWORD_HASH=TechKwiz2024!Admin

   # Application URLs
   NEXT_PUBLIC_APP_URL=https://your-actual-domain.com
   NEXT_PUBLIC_APP_DOMAIN=your-actual-domain.com

   # Analytics Integration
   NEXT_PUBLIC_ANALYTICS_ID=G-YOUR-ACTUAL-ID
   NEXT_PUBLIC_GTM_ID=GTM-YOUR-ACTUAL-ID

   # AdSense Configuration
   NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-your-actual-publisher-id
   ```

### Step 2: Configure GitHub Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

**Required Secrets:**
- `ADMIN_PASSWORD` → Admin panel password (`TechKwiz2024!Admin`)
- `ANALYTICS_ID` → Your GA4 Measurement ID
- `GTM_ID` → Your GTM Container ID
- `ADSENSE_PUBLISHER_ID` → Your AdSense Publisher ID
- `APP_URL` → Your production domain URL
- `APP_DOMAIN` → Your domain name (without https://)
- `FTP_HOST` → Your Hostinger FTP hostname
- `FTP_USERNAME` → Your Hostinger FTP username
- `FTP_PASSWORD` → Your Hostinger FTP password

### Step 3: Test Configuration

1. Build the application locally:
   ```bash
   cd frontend
   npm run build
   ```

2. Check for any environment variable warnings
3. Verify the build completes successfully

### Step 4: Deploy to Production

1. Push your changes to the main branch:
   ```bash
   git add .
   git commit -m "Configure production environment variables"
   git push origin main
   ```

2. Monitor the GitHub Actions deployment in the **Actions** tab

## 🔍 Verification Checklist

After deployment, verify these items work correctly:

### Core Application
- [ ] Main quiz loads at `https://your-domain.com`
- [ ] Admin panel accessible at `https://your-domain.com/jaseem`
- [ ] Admin authentication works with password `TechKwiz2024!Admin`
- [ ] All admin sections (Dashboard, Quiz Management, etc.) load correctly
- [ ] Sidebar collapse/expand functionality works on desktop
- [ ] Mobile admin drawer navigation works properly

### Analytics & Tracking
- [ ] Google Analytics tracking is active (check Real-time reports)
- [ ] Google Tag Manager is loading (check browser developer tools)
- [ ] Custom events are firing correctly (quiz completion, admin actions)
- [ ] No console errors related to analytics

### Monetization
- [ ] AdSense ads are displaying (if configured)
- [ ] Ad placements are working correctly
- [ ] Revenue tracking is functional

### Technical
- [ ] All links use the correct production domain
- [ ] HTTPS is working correctly
- [ ] No console errors related to missing environment variables
- [ ] Performance metrics are within acceptable ranges

## 🛠️ Troubleshooting

### Common Issues:

**Analytics not tracking:**
- Verify the GA4 Measurement ID format (starts with `G-`)
- Check browser developer tools for gtag errors
- Ensure analytics is enabled: `NEXT_PUBLIC_ENABLE_ANALYTICS=true`

**GTM not loading:**
- Verify the GTM Container ID format (starts with `GTM-`)
- Check if GTM container is published
- Look for GTM script errors in browser console

**AdSense not showing:**
- Verify Publisher ID format (starts with `ca-pub-`)
- Ensure AdSense account is approved
- Check for ad blocker interference

**Wrong domain in links:**
- Verify `NEXT_PUBLIC_APP_URL` has no trailing slash
- Ensure the domain matches your actual hosting domain
- Check Open Graph and Twitter card meta tags

**Admin panel not accessible:**
- Verify admin URL format: `https://your-domain.com/jaseem`
- Check admin password: `TechKwiz2024!Admin` (case-sensitive)
- Ensure `NEXT_PUBLIC_ADMIN_PASSWORD_HASH` is set correctly
- Try clearing browser cache and cookies

**Admin sidebar not working:**
- Verify screen width is 1024px+ for desktop collapse functionality
- Check browser console for JavaScript errors
- Ensure TechKwizAdminShell component is loading correctly
- Test on different browsers

**Admin sections not switching:**
- Check browser console for React errors
- Verify all admin components are deployed correctly
- Test individual admin section functionality
- Clear application cache and reload

## 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs for deployment errors
2. Verify all environment variables are correctly set
3. Test locally with `npm run dev` before deploying
4. Ensure your Hostinger hosting is active and configured correctly
