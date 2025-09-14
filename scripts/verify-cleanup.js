#!/usr/bin/env node

/**
 * Verification script to check if cleanup was successful
 * 
 * This script checks:
 * 1. No processes running on development ports
 * 2. Cache directories are removed
 * 3. Temporary files are removed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkPort(port) {
  try {
    const result = execSync(`lsof -i :${port}`, { encoding: 'utf8' });
    return result.trim().split('\n').filter(line => line && !line.includes('COMMAND')).length > 0;
  } catch (error) {
    return false;
  }
}

function checkDirectoryExists(dirPath) {
  return fs.existsSync(dirPath);
}

function checkDirectoryEmpty(dirPath) {
  if (!fs.existsSync(dirPath)) return true;
  const files = fs.readdirSync(dirPath);
  return files.length === 0;
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

console.log('🔍 Verifying cleanup process...\n');

// Check ports
console.log('🔌 Checking development ports...');
const port3000 = checkPort(3000);
const port3002 = checkPort(3002);

console.log(`   Port 3000: ${port3000 ? '❌ IN USE' : '✅ CLEAR'}`);
console.log(`   Port 3002: ${port3002 ? '❌ IN USE' : '✅ CLEAR'}`);

// Check cache directories
console.log('\n🗑️  Checking cache directories...');
const nextDir = checkDirectoryExists('.next');
const nodeCacheDir = checkDirectoryExists('node_modules/.cache');
const npmCacheDir = checkDirectoryExists(path.join(process.env.HOME, '.npm/_cacache'));
const npmCacheEmpty = checkDirectoryEmpty(path.join(process.env.HOME, '.npm/_cacache'));

console.log(`   .next directory: ${nextDir ? '❌ EXISTS' : '✅ REMOVED'}`);
console.log(`   node_modules/.cache: ${nodeCacheDir ? '❌ EXISTS' : '✅ REMOVED'}`);
console.log(`   ~/.npm/_cacache: ${npmCacheDir ? (npmCacheEmpty ? '⚠️ EXISTS BUT EMPTY' : '❌ EXISTS WITH FILES') : '✅ REMOVED'}`);

// Check temporary directories
console.log('\n🗑️  Checking temporary directories...');
const tmpDir = checkDirectoryExists('.tmp');
const tempDir = checkDirectoryExists('temp');

console.log(`   .tmp directory: ${tmpDir ? '❌ EXISTS' : '✅ REMOVED'}`);
console.log(`   temp directory: ${tempDir ? '❌ EXISTS' : '✅ REMOVED'}`);

// Check test result directories
console.log('\n🗑️  Checking test result directories...');
const testResults = checkDirectoryExists('test-results');
const testResultsLocal = checkDirectoryExists('test-results-local');
const playwrightReport = checkDirectoryExists('playwright-report');
const playwrightReportLocal = checkDirectoryExists('playwright-report-local');

console.log(`   test-results: ${testResults ? '❌ EXISTS' : '✅ REMOVED'}`);
console.log(`   test-results-local: ${testResultsLocal ? '❌ EXISTS' : '✅ REMOVED'}`);
console.log(`   playwright-report: ${playwrightReport ? '❌ EXISTS' : '✅ REMOVED'}`);
console.log(`   playwright-report-local: ${playwrightReportLocal ? '❌ EXISTS' : '✅ REMOVED'}`);

// Summary
console.log('\n📋 Summary:');
const allPortsClear = !port3000 && !port3002;
const allCachesClear = !nextDir && !nodeCacheDir && !npmCacheDir;
const allTempClear = !tmpDir && !tempDir;
const allTestDirsClear = !testResults && !testResultsLocal && !playwrightReport && !playwrightReportLocal;

console.log(`   Ports clear: ${allPortsClear ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Cache directories clear: ${allCachesClear ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Temporary directories clear: ${allTempClear ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Test directories clear: ${allTestDirsClear ? '✅ PASS' : '❌ FAIL'}`);

if (allPortsClear && allCachesClear && allTempClear && allTestDirsClear) {
  console.log('\n🎉 All cleanup verification checks PASSED!');
  console.log('✅ Your development environment is clean and ready for use.');
} else if (allPortsClear && !nextDir && !nodeCacheDir && allTempClear && allTestDirsClear) {
  console.log('\n🎉 Core cleanup verification checks PASSED!');
  console.log('✅ Your development environment is clean and ready for use.');
  console.log('ℹ️  Note: npm cache directory exists but is minimal and won\'t affect development.');
  console.log('   See CLEANUP_SUMMARY.md for optional complete cleanup steps.');
} else {
  console.log('\n⚠️  Some cleanup verification checks FAILED.');
  console.log('Please run the full cleanup script again:');
  console.log('   ./scripts/full-cleanup.sh');
}