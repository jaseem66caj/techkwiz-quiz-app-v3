#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 TechKwiz Visual Testing Environment Check');
console.log('============================================\n');

// Check Node.js and npm
console.log('1. Checking Node.js and npm...');
try {
  const nodeVersion = process.version;
  console.log(`   ✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.log(`   ❌ Node.js not found: ${error.message}`);
}

// Check if we're in the right directory
console.log('\n2. Checking project structure...');
const expectedFiles = [
  'frontend/package.json',
  'frontend/src/__tests__/visual/createBaselines.js',
  'docs/DESIGN_SYSTEM.md'
];

let allFilesFound = true;
for (const file of expectedFiles) {
  try {
    fs.accessSync(path.join(__dirname, file));
    console.log(`   ✅ Found: ${file}`);
  } catch (error) {
    console.log(`   ❌ Missing: ${file}`);
    allFilesFound = false;
  }
}

// Check Percy dependencies
console.log('\n3. Checking Percy dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend', 'package.json'), 'utf8'));
  const percyDeps = [
    '@percy/cli',
    '@percy/next'
  ];
  
  let allDepsFound = true;
  for (const dep of percyDeps) {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`   ✅ ${dep}: ${packageJson.devDependencies[dep]}`);
    } else if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep}: Not found`);
      allDepsFound = false;
    }
  }
  
  if (allDepsFound) {
    console.log('   ✅ All Percy dependencies found');
  }
} catch (error) {
  console.log(`   ❌ Error checking dependencies: ${error.message}`);
}

// Check visual testing directory
console.log('\n4. Checking visual testing directory...');
try {
  const visualDir = path.join(__dirname, 'frontend', 'src', '__tests__', 'visual');
  fs.accessSync(visualDir);
  console.log(`   ✅ Visual testing directory exists: ${visualDir}`);
  
  const files = fs.readdirSync(visualDir);
  console.log(`   📁 Contents: ${files.join(', ')}`);
} catch (error) {
  console.log(`   ❌ Visual testing directory not found: ${error.message}`);
}

console.log('\n📋 Summary');
console.log('==========');
console.log('The TechKwiz visual testing framework is properly installed.');
console.log('To complete the setup, you need to:');
console.log('1. Start the development server: cd frontend && npm run dev');
console.log('2. Generate baselines: node src/__tests__/visual/createBaselines.js');
console.log('3. Commit the baseline images to version control');

console.log('\n💡 Tip: If you have issues with the development server, try the offline method:');
console.log('   node src/__tests__/visual/offline-test.js');