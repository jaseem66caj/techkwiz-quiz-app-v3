#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

console.log('🔍 Running bundle analysis...');

// Set environment variable and run build
const analyzeProcess = exec('ANALYZE=true npm run build', { cwd: process.cwd() });

analyzeProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
});

analyzeProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

analyzeProcess.on('close', (code) => {
  console.log(`\nBundle analysis completed with exit code ${code}`);
  
  // Check if analysis report was generated
  if (fs.existsSync('.next/analyze/client.html')) {
    console.log('✅ Bundle analysis report generated at .next/analyze/client.html');
    console.log('📊 Open this file in your browser to view the bundle analysis');
  } else {
    console.log('⚠️ Bundle analysis report not found. Make sure @next/bundle-analyzer is installed.');
  }
});