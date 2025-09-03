# GitHub Repository Setup Guide

This guide will help you set up a GitHub repository for the TechKwiz-v8 project.

## Step 1: Create a New Repository on GitHub

1. Go to https://github.com/new (make sure you're logged in to your GitHub account)
2. Enter repository name: `TechKwiz-v8`
3. Choose Public or Private (your choice)
4. **Important**: Leave all checkboxes unchecked (don't initialize with README, .gitignore, or license)
5. Click "Create repository"

## Step 2: Note the Repository URL

After creating the repository, you'll see a page with the repository URL. It will look like:
```
https://github.com/YOUR_USERNAME/TechKwiz-v8.git
```

Make note of this URL as you'll need it in Step 4.

## Step 3: Prepare Your Local Repository

The local repository is already set up with all the necessary files. We just need to connect it to GitHub.

## Step 4: Connect Local Repository to GitHub

Run the following commands in your terminal:

```bash
# Navigate to your project directory
cd /Users/jaseem/Documents/GitHub/Techkwiz-v8

# Add the GitHub repository as a remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Techkwiz-v8.git

# Verify the remote was added
git remote -v
```

## Step 5: Commit and Push Files

```bash
# Stage all files
git add .

# Commit the files
git commit -m "Initial commit: TechKwiz-v8 with Playwright visual testing implementation"

# Push to GitHub
git push -u origin main
```

## Step 6: Verify on GitHub

1. Go to your repository page on GitHub
2. Refresh the page
3. You should see all your files uploaded

## Repository Contents

Your repository will include:

1. **Core Application**:
   - Next.js 15 frontend with TypeScript
   - All quiz functionality
   - Responsive design
   - Reward system

2. **Visual Testing System**:
   - Playwright implementation
   - Multi-viewport testing
   - Automated screenshot comparison
   - Test scripts and configuration

3. **Documentation**:
   - Design system documentation
   - Visual testing implementation details
   - Setup and usage guides

4. **Cleanup Work**:
   - Removal of unused Percy/Puppeteer dependencies
   - Streamlined dependency structure

## Branch Strategy

The main branch contains the stable version of the application. For future development:

```bash
# Create and switch to a new feature branch
git checkout -b feature/new-feature

# Make your changes
# ... code changes ...

# Commit and push the feature branch
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create a pull request on GitHub to merge into main
```

## Updating the Repository

For future updates:

```bash
# Make sure you're on the main branch
git checkout main

# Pull any changes from GitHub
git pull origin main

# Make your changes
# ... code changes ...

# Commit and push
git add .
git commit -m "Description of changes"
git push origin main
```

## Visual Testing Baselines

The visual testing baselines are stored in:
`frontend/src/__tests__/visual/baselines/`

If you generate new baselines, make sure to commit them:
```bash
git add frontend/src/__tests__/visual/baselines/
git commit -m "Update visual testing baselines"
git push origin main
```

## Troubleshooting

### If you get "Permission denied" errors:
Make sure you're using the correct GitHub credentials. You might need to set up a Personal Access Token:
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with "repo" permissions
3. Use this token instead of your password when prompted

### If you get "Updates were rejected" errors:
Someone else may have pushed changes. Pull first:
```bash
git pull origin main
# Resolve any conflicts if necessary
git push origin main
```

## Questions or Issues?

If you encounter any issues during the setup process, please check:
1. You're logged into the correct GitHub account
2. The repository name matches exactly
3. You have proper internet connectivity
4. Git is properly installed on your system