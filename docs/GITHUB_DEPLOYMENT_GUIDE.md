# 🚀 GitHub Deployment Guide for TechKwiz-v7 to Hostinger

## 📋 Overview
This guide sets up automated deployment from GitHub to your Hostinger hosting using GitHub Actions. Every time you push to the main branch, your application will automatically build and deploy.

## 🔧 Prerequisites
- GitHub account
- Hostinger hosting account with FTP access
- Your custom domain configured in Hostinger

## 📁 Step 1: Create GitHub Repository

### Option A: Create New Repository
1. Go to [GitHub.com](https://github.com) and click "New Repository"
2. Name: `techkwiz-v7` (or your preferred name)
3. Description: `TechKwiz-v7 - Interactive Tech Quiz Game`
4. Set to Public or Private (your choice)
5. Initialize with README
6. Click "Create Repository"

### Option B: Use Existing Repository
If you already have a repository, ensure it's updated with the latest code.

## 📤 Step 2: Upload Your Code to GitHub

### Method A: Using GitHub Web Interface
1. In your repository, click "uploading an existing file"
2. Drag and drop your entire `frontend` folder
3. Commit with message: "Initial TechKwiz-v7 deployment setup"

### Method B: Using Git Command Line
```bash
# Navigate to your project directory
cd /path/to/Techkwiz-v7

# Initialize git (if not already done)
git init

# Add GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/techkwiz-v7.git

# Add all files
git add .

# Commit changes
git commit -m "Initial TechKwiz-v7 deployment setup"

# Push to GitHub
git push -u origin main
```

## 🔐 Step 3: Configure GitHub Secrets

GitHub Secrets store sensitive information like FTP credentials securely.

### 3.1 Get Hostinger FTP Credentials
1. Log into Hostinger Control Panel
2. Go to **Hosting** → **Manage** → **FTP Accounts**
3. Note down:
   - **FTP Host**: Usually `your-domain.com` or `ftp.your-domain.com`
   - **Username**: Your FTP username
   - **Password**: Your FTP password

### 3.2 Add Secrets to GitHub Repository
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of these:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `FTP_HOST` | Your Hostinger FTP host | `your-domain.com` |
| `FTP_USERNAME` | Your FTP username | `u123456789` |
| `FTP_PASSWORD` | Your FTP password | `your-ftp-password` |
| `APP_URL` | Your website URL | `https://your-domain.com` |
| `APP_DOMAIN` | Your domain name | `your-domain.com` |
| `ADMIN_PASSWORD` | Admin panel password | `replace-with-a-server-side-secret` |
| `ANALYTICS_ID` | Google Analytics ID | `G-XXXXXXXXXX` |
| `GTM_ID` | Google Tag Manager ID | `GTM-XXXXXXX` |
| `ADSENSE_PUBLISHER_ID` | AdSense Publisher ID | `ca-pub-1234567890123456` |

### 3.3 How to Add Each Secret
1. Click **New repository secret**
2. Enter the **Name** (exactly as shown above)
3. Enter the **Value**
4. Click **Add secret**
5. Repeat for all secrets

## ⚙️ Step 4: Configure Hostinger for GitHub Deployment

### 4.1 Prepare Hostinger Directory
1. Access Hostinger File Manager
2. Navigate to `public_html` directory
3. **Delete any existing files** (like default index.html)
4. Ensure the directory is empty and ready for deployment

### 4.2 Verify FTP Access
Test your FTP credentials using an FTP client like FileZilla:
```
Host: your-domain.com
Username: [from FTP_USERNAME secret]
Password: [from FTP_PASSWORD secret]
Port: 21
```

## 🚀 Step 5: Trigger First Deployment

### 5.1 Manual Deployment
1. Go to your GitHub repository
2. Click **Actions** tab
3. Click **Deploy TechKwiz-v7 to Hostinger** workflow
4. Click **Run workflow** → **Run workflow**
5. Wait for deployment to complete (usually 3-5 minutes)

### 5.2 Automatic Deployment
From now on, every time you:
- Push to `main` branch
- Merge a pull request to `main`
- The deployment will automatically trigger

## 📊 Step 6: Monitor Deployment

### 6.1 GitHub Actions Dashboard
1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Monitor the progress of each step:
   - ✅ Checkout Repository
   - ✅ Setup Node.js
   - ✅ Install Dependencies
   - ✅ Build Application
   - ✅ Deploy to Hostinger

### 6.2 Deployment Logs
- Green checkmarks = Success
- Red X = Failed (click to see error details)
- Yellow circle = In progress

## ✅ Step 7: Verify Deployment

### 7.1 Basic Verification
1. Visit your domain: `https://your-domain.com`
2. Check that the homepage loads correctly
3. Verify SSL certificate (green padlock)
4. Test mobile responsiveness

### 7.2 Feature Testing
```
✅ Homepage loads with TechKwiz branding
✅ Quiz categories page (/start) works
✅ Quiz functionality (questions, timer, scoring)
✅ Reward popups appear after answers
✅ Treasure chest GIF animations play
✅ Coin earning and localStorage persistence
✅ Navigation between pages
✅ Mobile responsive design
```

### 7.3 Admin Panel Testing
```
✅ Admin panel accessible at https://your-domain.com/jaseem
✅ Admin authentication works with password: replace-with-a-server-side-secret
✅ Dashboard section loads with statistics
✅ Quiz Management section displays questions table
✅ Reward Configuration section shows settings
✅ Analytics & Integrations section loads correctly
✅ System Settings section accessible
✅ Sidebar collapse/expand works on desktop (1024px+)
✅ Mobile drawer navigation works properly
✅ All admin sections switch content correctly
✅ No console errors in admin panel
```

### 7.4 Analytics Verification
1. Check Google Analytics Real-time reports
2. Verify events are being tracked
3. Test AdSense ads (if configured)

## 🔄 Step 8: Making Updates

### 8.1 Code Updates
1. Make changes to your local code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```
3. GitHub Actions will automatically deploy the changes

### 8.2 Environment Variables Updates
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on the secret you want to update
3. Click **Update** and enter new value
4. Trigger a new deployment

## 🛠️ Troubleshooting

### Issue 1: Deployment Fails with FTP Error
**Solution:**
- Verify FTP credentials in GitHub Secrets
- Check if Hostinger FTP service is running
- Ensure `public_html` directory exists and is writable

### Issue 2: Build Fails
**Solution:**
- Check the build logs in GitHub Actions
- Verify all dependencies are properly listed in package.json
- Ensure environment variables are correctly set

### Issue 3: Website Shows 404 Errors
**Solution:**
- Verify files were uploaded to `public_html` (not a subdirectory)
- Check that `.htaccess` file was uploaded
- Ensure index.html exists in the root directory

### Issue 4: Admin Panel Not Accessible
**Solution:**
- Verify admin URL format: `https://your-domain.com/jaseem`
- Check admin password: `replace-with-a-server-side-secret` (case-sensitive)
- Ensure `ADMIN_PASSWORD` secret is set correctly
- Clear browser cache and cookies
- Try incognito/private browsing mode

### Issue 5: Admin Sidebar Not Working
**Solution:**
- Verify screen width is 1024px+ for desktop collapse functionality
- Check browser console for JavaScript errors
- Ensure TechKwizAdminShell component is loading correctly
- Test on different browsers

### Issue 6: Analytics Not Working
**Solution:**
- Verify `ANALYTICS_ID` secret is correct
- Check browser console for JavaScript errors
- Ensure HTTPS is working (required for GA4)

## 📈 Advanced Features

### 8.1 Staging Environment
Create a staging branch for testing:
```bash
git checkout -b staging
git push origin staging
```
Modify the workflow to deploy staging branch to a subdomain.

### 8.2 Rollback Strategy
If deployment fails:
1. Go to **Actions** tab
2. Find the last successful deployment
3. Click **Re-run jobs** to redeploy previous version

### 8.3 Custom Domain with Subdomain
Deploy to subdomain like `quiz.your-domain.com`:
1. Create subdomain in Hostinger
2. Update `server-dir` in workflow to `./quiz/`
3. Update `APP_URL` secret to subdomain URL

## 🎉 Benefits of GitHub Deployment

✅ **Automated**: No manual file uploads
✅ **Version Control**: Track all changes
✅ **Rollback**: Easy to revert to previous versions
✅ **Collaboration**: Multiple developers can contribute
✅ **CI/CD**: Continuous integration and deployment
✅ **Secure**: Credentials stored safely in GitHub Secrets
✅ **Free**: GitHub Actions provides free build minutes

## 📞 Support

### GitHub Issues
- Create issues in your repository for bug tracking
- Use pull requests for feature development

### Deployment Support
- Check GitHub Actions logs for detailed error messages
- Hostinger support for FTP/hosting issues
- GitHub community for Actions-related questions

---

## 🎯 Quick Start Summary

1. **Create GitHub repository** and upload your code
2. **Add FTP credentials** to GitHub Secrets
3. **Configure domain and analytics** secrets
4. **Run the deployment workflow**
5. **Verify your site** is live and working
6. **Make updates** by pushing to main branch

Your TechKwiz-v7 application will now automatically deploy to Hostinger whenever you update your code! 🚀
