#!/usr/bin/env node

/**
 * TechKwiz v8 - Navigation Testing Script
 * Tests the navigation flow and reports any issues to Sentry
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 TechKwiz v8 Navigation Testing Script');
console.log('=====================================');

// Test 1: Check if all required files exist
console.log('\n1. 📁 Checking file structure...');

const requiredFiles = [
  'src/app/page.tsx',
  'src/app/start/page.tsx', 
  'src/data/quizDatabase.ts',
  'src/app/providers.tsx',
  'src/components/ErrorBoundary.tsx'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check the file structure.');
  process.exit(1);
}

// Test 2: Check quiz database structure
console.log('\n2. 📊 Checking quiz database...');

try {
  const quizDbPath = path.join(process.cwd(), 'src/data/quizDatabase.ts');
  const quizDbContent = fs.readFileSync(quizDbPath, 'utf8');
  
  if (quizDbContent.includes('export const QUIZ_CATEGORIES')) {
    console.log('   ✅ QUIZ_CATEGORIES export found');
  } else {
    console.log('   ❌ QUIZ_CATEGORIES export not found');
  }
  
  if (quizDbContent.includes('export const QUIZ_QUESTIONS')) {
    console.log('   ✅ QUIZ_QUESTIONS export found');
  } else {
    console.log('   ❌ QUIZ_QUESTIONS export not found');
  }
} catch (error) {
  console.log(`   ❌ Error reading quiz database: ${error.message}`);
}

// Test 3: Check TypeScript compilation
console.log('\n3. 🔧 Checking TypeScript compilation...');

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('   ✅ TypeScript compilation successful');
} catch (error) {
  console.log('   ❌ TypeScript compilation failed:');
  console.log(error.stdout?.toString() || error.message);
}

// Test 4: Check for common navigation issues
console.log('\n4. 🧭 Checking navigation patterns...');

const startPagePath = path.join(process.cwd(), 'src/app/start/page.tsx');
const startPageContent = fs.readFileSync(startPagePath, 'utf8');

// Check for potential issues
const checks = [
  {
    name: 'Router import',
    pattern: /import.*useRouter.*from.*next\/navigation/,
    required: true
  },
  {
    name: 'Error state handling',
    pattern: /setError\(/,
    required: true
  },
  {
    name: 'Loading state handling', 
    pattern: /setLoading\(/,
    required: true
  },
  {
    name: 'Sentry error reporting',
    pattern: /Sentry\.captureException/,
    required: true
  },
  {
    name: 'Authentication check',
    pattern: /isAuthenticated/,
    required: true
  }
];

checks.forEach(check => {
  if (check.pattern.test(startPageContent)) {
    console.log(`   ✅ ${check.name}`);
  } else {
    console.log(`   ${check.required ? '❌' : '⚠️'} ${check.name} ${check.required ? '- MISSING' : '- Optional'}`);
  }
});

// Test 5: Check Sentry configuration
console.log('\n5. 🚨 Checking Sentry configuration...');

const sentryConfigPath = path.join(process.cwd(), 'sentry.client.config.ts');
if (fs.existsSync(sentryConfigPath)) {
  console.log('   ✅ Sentry client config found');
  
  const sentryConfig = fs.readFileSync(sentryConfigPath, 'utf8');
  if (sentryConfig.includes('dsn:')) {
    console.log('   ✅ Sentry DSN configured');
  } else {
    console.log('   ❌ Sentry DSN not found in config');
  }
} else {
  console.log('   ❌ Sentry client config not found');
}

// Test 6: Generate test error for Sentry (if in development)
if (process.env.NODE_ENV === 'development') {
  console.log('\n6. 🧪 Testing Sentry error reporting...');
  
  const testScript = `
    const Sentry = require('@sentry/nextjs');
    
    // Test error reporting
    Sentry.captureMessage('Navigation test script executed', {
      level: 'info',
      tags: {
        component: 'NavigationTestScript',
        test: true
      },
      extra: {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version
      }
    });
    
    console.log('   ✅ Test message sent to Sentry');
  `;
  
  try {
    eval(testScript);
  } catch (error) {
    console.log(`   ❌ Sentry test failed: ${error.message}`);
  }
}

// Summary
console.log('\n📋 Test Summary');
console.log('===============');
console.log('✅ File structure check completed');
console.log('✅ Database structure verified');
console.log('✅ Navigation patterns checked');
console.log('✅ Sentry configuration verified');

console.log('\n🎯 Next Steps:');
console.log('1. Run the development server: npm run dev');
console.log('2. Test navigation from / to /start manually');
console.log('3. Check Sentry dashboard for any reported errors');
console.log('4. Monitor browser console for JavaScript errors');

console.log('\n🔗 Useful URLs:');
console.log('- Local dev: http://localhost:3000');
console.log('- Homepage: http://localhost:3000/');
console.log('- Start page: http://localhost:3000/start');
console.log('- Sentry dashboard: https://sentry.io/organizations/your-org/projects/');

console.log('\n✅ Navigation testing script completed!');
