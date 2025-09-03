# Module Not Found Error - Troubleshooting Guide

## Issue Description
You're encountering a "module not found" error when trying to run the visual testing scripts. This typically indicates that required dependencies are not properly installed or accessible.

## Root Causes and Solutions

### 1. Missing Dependencies
The most common cause is that Puppeteer or Percy modules are not installed.

#### Solution A: Clean Installation
```bash
# Navigate to frontend directory
cd /Users/jaseem/Documents/GitHub/Techkwiz-v8/frontend

# Remove node_modules and lock files
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Install all dependencies
npm install
```

#### Solution B: Install Specific Modules
```bash
# Navigate to frontend directory
cd /Users/jaseem/Documents/GitHub/Techkwiz-v8/frontend

# Install Puppeteer
npm install puppeteer

# Install Percy modules
npm install @percy/cli @percy/next
```

### 2. Path Issues
The scripts might be using incorrect paths to import modules.

#### Solution: Verify Import Statements
Check the import statements in the visual testing scripts:
- [createBaselines.js](file:///Users/jaseem/Documents/GitHub/Techkwiz-v8/frontend/src/__tests__/visual/createBaselines.js)
- [offline-test.js](file:///Users/jaseem/Documents/GitHub/Techkwiz-v8/frontend/src/__tests__/visual/offline-test.js)

The correct import for Percy should be:
```javascript
const { percySnapshot } = require('@percy/next');
```

### 3. Node.js Version Compatibility
Ensure you're using a compatible Node.js version.

#### Solution: Check and Update Node.js
```bash
# Check current versions
node --version
npm --version

# If needed, update Node.js to v18+ or v20+
```

### 4. Permission Issues
File permissions might prevent modules from being accessed.

#### Solution: Fix Permissions
```bash
# Navigate to project directory
cd /Users/jaseem/Documents/GitHub/Techkwiz-v8

# Fix permissions
sudo chown -R $(whoami) frontend/node_modules
sudo chmod -R 755 frontend/node_modules
```

## Verification Steps

### Step 1: Check Installed Modules
```bash
cd /Users/jaseem/Documents/GitHub/Techkwiz-v8/frontend

# List installed modules
npm list puppeteer
npm list @percy/next
npm list @percy/cli
```

### Step 2: Manual Module Test
Create a simple test file to verify modules can be imported:
```bash
cd /Users/jaseem/Documents/GitHub/Techkwiz-v8/frontend

# Create test file
echo "try {
  require('puppeteer');
  console.log('✅ Puppeteer import successful');
} catch (e) {
  console.log('❌ Puppeteer import failed:', e.message);
}

try {
  require('@percy/next');
  console.log('✅ Percy/Next import successful');
} catch (e) {
  console.log('❌ Percy/Next import failed:', e.message);
}" > module-test.js

# Run test
node module-test.js
```

### Step 3: Reinstall with Verbose Output
```bash
cd /Users/jaseem/Documents/GitHub/Techkwiz-v8/frontend

# Install with verbose logging
npm install --verbose
```

## Alternative Approach: Use npx

If direct installation continues to fail, try using npx to run commands:

```bash
# Instead of running scripts directly, use npx
cd /Users/jaseem/Documents/GitHub/Techkwiz-v8/frontend

# Run Puppeteer script with npx
npx node src/__tests__/visual/offline-test.js
```

## Environment Variables

Ensure required environment variables are set:

```bash
# Check if PERCY_TOKEN is needed
echo $PERCY_TOKEN

# If needed, set it (replace with your actual token)
export PERCY_TOKEN=your_actual_token_here
```

## Docker Alternative

If local installation continues to fail, consider using Docker:

```bash
# Create a simple Dockerfile
echo "FROM node:18
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
CMD [\"node\", \"src/__tests__/visual/offline-test.js\"]" > Dockerfile

# Build and run
docker build -t techkwiz-visual-test .
docker run techkwiz-visual-test
```

## Support Resources

1. **Percy Documentation**: https://docs.percy.io
2. **Puppeteer Documentation**: https://pptr.dev
3. **Node.js Troubleshooting**: https://nodejs.org/en/docs/

## Next Steps

1. Try the clean installation approach first
2. If that fails, check the specific error messages
3. Verify Node.js version compatibility
4. Contact support if issues persist

The visual testing framework is properly configured in your codebase. Once the module dependencies are resolved, the scripts should run successfully and generate the baseline images needed for visual regression testing.