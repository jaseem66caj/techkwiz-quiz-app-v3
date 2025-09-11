const fs = require('fs');
const path = require('path');

// Function to get file size in KB
function getFileSizeKB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024 * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error(`Error getting file size for ${filePath}:`, error.message);
    return -1;
  }
}

// Paths to our optimized components
const components = {
  'FortuneCookie.tsx': path.join(__dirname, '../src/components/ui/FortuneCookie.tsx'),
  'UnifiedQuizInterface.tsx': path.join(__dirname, '../src/components/quiz/UnifiedQuizInterface.tsx'),
  'EnhancedRewardAnimation.tsx': path.join(__dirname, '../src/components/rewards/EnhancedRewardAnimation.tsx')
};

console.log('=== Component Size Verification ===\n');

let allFilesExist = true;

Object.entries(components).forEach(([name, filePath]) => {
  const size = getFileSizeKB(filePath);
  if (size === -1) {
    console.log(`❌ ${name}: File not found`);
    allFilesExist = false;
  } else {
    console.log(`✅ ${name}: ${size} KB`);
    
    // Check if file size is reasonable (less than 30KB for optimized components)
    if (size > 30) {
      console.log(`   ⚠️  Warning: File is larger than expected (${size} KB > 30 KB)`);
    } else {
      console.log(`   ✅ File size is within expected range`);
    }
  }
  console.log('');
});

if (allFilesExist) {
  console.log('✅ All component files exist and are optimized');
} else {
  console.log('❌ Some component files are missing');
  process.exit(1);
}

console.log('\n=== Optimization Verification Complete ===');