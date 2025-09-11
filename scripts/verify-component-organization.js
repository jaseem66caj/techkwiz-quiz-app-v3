const fs = require('fs');
const path = require('path');

// Function to check if a file exists
function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

// Function to check if a directory exists
function directoryExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

console.log('=== Component Organization Verification ===\n');

// Check that all component directories exist
const componentDirs = [
  'ads',
  'analytics',
  'layout',
  'modals',
  'navigation',
  'quiz',
  'rewards',
  'ui',
  'user'
];

let allDirsExist = true;
console.log('1. Checking component directories...');

componentDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '../src/components', dir);
  if (directoryExists(dirPath)) {
    console.log(`   ✅ ${dir}/ directory exists`);
  } else {
    console.log(`   ❌ ${dir}/ directory missing`);
    allDirsExist = false;
  }
});

console.log('');

// Check that all index files exist
let allIndexFilesExist = true;
console.log('2. Checking index files...');

componentDirs.forEach(dir => {
  const indexPath = path.join(__dirname, '../src/components', dir, 'index.ts');
  if (fileExists(indexPath)) {
    console.log(`   ✅ ${dir}/index.ts exists`);
  } else {
    console.log(`   ❌ ${dir}/index.ts missing`);
    allIndexFilesExist = false;
  }
});

console.log('');

// Check that key components exist in their respective directories
const keyComponents = {
  'ads': ['AdBanner.tsx'],
  'analytics': ['GoogleAnalytics.tsx'],
  'layout': ['ErrorBoundary.tsx', 'QuizErrorBoundary.tsx', 'LayoutWrapper.tsx', 'GlobalErrorInitializer.tsx', 'ClientHomePage.tsx'],
  'modals': ['TimeUpModal.tsx', 'ExitConfirmationModal.tsx', 'AuthModal.tsx'],
  'navigation': ['UnifiedNavigation.tsx'],
  'quiz': ['UnifiedQuizInterface.tsx', 'QuizResult.tsx', 'CountdownTimer.tsx'],
  'rewards': ['UnifiedRewardPopup.tsx', 'EnhancedRewardAnimation.tsx'],
  'ui': ['CategoryCard.tsx', 'FortuneCookie.tsx', 'EnhancedCoinDisplay.tsx'],
  'user': ['CreateProfile.tsx', 'AchievementNotification.tsx']
};

let allKeyComponentsExist = true;
console.log('3. Checking key components...');

Object.entries(keyComponents).forEach(([dir, components]) => {
  components.forEach(component => {
    const componentPath = path.join(__dirname, '../src/components', dir, component);
    if (fileExists(componentPath)) {
      console.log(`   ✅ ${dir}/${component} exists`);
    } else {
      console.log(`   ❌ ${dir}/${component} missing`);
      allKeyComponentsExist = false;
    }
  });
});

console.log('');

// Overall result
if (allDirsExist && allIndexFilesExist && allKeyComponentsExist) {
  console.log('✅ Component organization verification PASSED');
  console.log('   All directories, index files, and key components are in place');
} else {
  console.log('❌ Component organization verification FAILED');
  if (!allDirsExist) console.log('   Some component directories are missing');
  if (!allIndexFilesExist) console.log('   Some index files are missing');
  if (!allKeyComponentsExist) console.log('   Some key components are missing');
  process.exit(1);
}

console.log('\n=== Verification Complete ===');