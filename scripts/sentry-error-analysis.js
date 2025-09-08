#!/usr/bin/env node

/**
 * Sentry Error Analysis and Fix Script for TechKwiz v8
 * 
 * This script analyzes common error patterns in the application
 * and provides automated fixes for critical issues.
 */

const fs = require('fs');
const path = require('path');

class SentryErrorAnalyzer {
  constructor() {
    this.errors = [];
    this.fixes = [];
    this.srcPath = path.join(__dirname, '..', 'src');
  }

  // Analyze common error patterns
  async analyzeErrors() {
    console.log('🔍 Starting Sentry Error Analysis for TechKwiz v8...\n');

    // 1. Check for unhandled promise rejections
    await this.checkUnhandledPromises();
    
    // 2. Check for localStorage access errors
    await this.checkLocalStorageErrors();
    
    // 3. Check for API call errors
    await this.checkApiErrors();
    
    // 4. Check for component mounting errors
    await this.checkComponentErrors();
    
    // 5. Check for navigation errors
    await this.checkNavigationErrors();

    // Generate report
    this.generateReport();
  }

  // Check for unhandled promise rejections
  async checkUnhandledPromises() {
    console.log('📋 Checking for unhandled promise rejections...');
    
    const files = this.getJSFiles();
    let issuesFound = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for async functions without try-catch
      const asyncMatches = content.match(/async\s+\w+[^{]*{[^}]*}/g);
      if (asyncMatches) {
        for (const match of asyncMatches) {
          if (!match.includes('try') && !match.includes('catch')) {
            issuesFound++;
            this.errors.push({
              type: 'UNHANDLED_PROMISE',
              file: file.replace(this.srcPath, ''),
              severity: 'HIGH',
              description: 'Async function without error handling',
              code: match.substring(0, 100) + '...'
            });
          }
        }
      }
    }

    console.log(`   Found ${issuesFound} potential unhandled promise issues\n`);
  }

  // Check for localStorage access errors
  async checkLocalStorageErrors() {
    console.log('💾 Checking for localStorage access errors...');
    
    const files = this.getJSFiles();
    let issuesFound = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for direct localStorage access without error handling
      const localStorageMatches = content.match(/localStorage\.(getItem|setItem)[^}]*(?!try|catch)/g);
      if (localStorageMatches) {
        for (const match of localStorageMatches) {
          // Check if it's already wrapped in try-catch
          const beforeMatch = content.substring(0, content.indexOf(match));
          const afterMatch = content.substring(content.indexOf(match) + match.length);
          
          if (!beforeMatch.includes('try') || !afterMatch.includes('catch')) {
            issuesFound++;
            this.errors.push({
              type: 'LOCALSTORAGE_ERROR',
              file: file.replace(this.srcPath, ''),
              severity: 'MEDIUM',
              description: 'localStorage access without error handling',
              code: match
            });
          }
        }
      }
    }

    console.log(`   Found ${issuesFound} potential localStorage issues\n`);
  }

  // Check for API call errors
  async checkApiErrors() {
    console.log('🌐 Checking for API call errors...');
    
    const files = this.getJSFiles();
    let issuesFound = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for fetch calls without proper error handling
      const fetchMatches = content.match(/fetch\([^)]*\)[^}]*(?!\.catch|try)/g);
      if (fetchMatches) {
        for (const match of fetchMatches) {
          issuesFound++;
          this.errors.push({
            type: 'API_ERROR',
            file: file.replace(this.srcPath, ''),
            severity: 'HIGH',
            description: 'Fetch call without error handling',
            code: match.substring(0, 100) + '...'
          });
        }
      }
    }

    console.log(`   Found ${issuesFound} potential API call issues\n`);
  }

  // Check for component mounting errors
  async checkComponentErrors() {
    console.log('⚛️ Checking for component mounting errors...');
    
    const files = this.getJSFiles();
    let issuesFound = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for useEffect without cleanup
      const useEffectMatches = content.match(/useEffect\([^}]*\}[^,]*,\s*\[[^\]]*\]\)/g);
      if (useEffectMatches) {
        for (const match of useEffectMatches) {
          if (!match.includes('return') && (match.includes('setInterval') || match.includes('setTimeout'))) {
            issuesFound++;
            this.errors.push({
              type: 'COMPONENT_CLEANUP',
              file: file.replace(this.srcPath, ''),
              severity: 'MEDIUM',
              description: 'useEffect with timer without cleanup',
              code: match.substring(0, 100) + '...'
            });
          }
        }
      }
    }

    console.log(`   Found ${issuesFound} potential component cleanup issues\n`);
  }

  // Check for navigation errors
  async checkNavigationErrors() {
    console.log('🧭 Checking for navigation errors...');
    
    const files = this.getJSFiles();
    let issuesFound = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for router.push without error handling
      const routerMatches = content.match(/router\.push\([^)]*\)(?![^}]*catch)/g);
      if (routerMatches) {
        for (const match of routerMatches) {
          issuesFound++;
          this.errors.push({
            type: 'NAVIGATION_ERROR',
            file: file.replace(this.srcPath, ''),
            severity: 'MEDIUM',
            description: 'Router navigation without error handling',
            code: match
          });
        }
      }
    }

    console.log(`   Found ${issuesFound} potential navigation issues\n`);
  }

  // Get all JavaScript/TypeScript files
  getJSFiles() {
    const files = [];
    
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(this.srcPath);
    return files;
  }

  // Generate comprehensive report
  generateReport() {
    console.log('📊 SENTRY ERROR ANALYSIS REPORT');
    console.log('================================\n');

    // Group errors by type
    const errorsByType = {};
    this.errors.forEach(error => {
      if (!errorsByType[error.type]) {
        errorsByType[error.type] = [];
      }
      errorsByType[error.type].push(error);
    });

    // Display summary
    console.log('📈 SUMMARY:');
    console.log(`Total Issues Found: ${this.errors.length}`);
    console.log(`High Severity: ${this.errors.filter(e => e.severity === 'HIGH').length}`);
    console.log(`Medium Severity: ${this.errors.filter(e => e.severity === 'MEDIUM').length}`);
    console.log(`Low Severity: ${this.errors.filter(e => e.severity === 'LOW').length}\n`);

    // Display by category
    Object.keys(errorsByType).forEach(type => {
      console.log(`🔍 ${type}:`);
      console.log(`   Count: ${errorsByType[type].length}`);
      console.log(`   Files affected: ${[...new Set(errorsByType[type].map(e => e.file))].length}`);
      
      // Show top 3 examples
      errorsByType[type].slice(0, 3).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.file}: ${error.description}`);
      });
      console.log('');
    });

    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    console.log('1. Add try-catch blocks to all async functions');
    console.log('2. Wrap localStorage access in error handlers');
    console.log('3. Add .catch() to all fetch calls');
    console.log('4. Add cleanup functions to useEffect hooks');
    console.log('5. Wrap router navigation in try-catch blocks\n');

    // Save detailed report
    const reportPath = path.join(__dirname, '..', 'sentry-error-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.errors.length,
        highSeverity: this.errors.filter(e => e.severity === 'HIGH').length,
        mediumSeverity: this.errors.filter(e => e.severity === 'MEDIUM').length,
        lowSeverity: this.errors.filter(e => e.severity === 'LOW').length
      },
      errorsByType,
      allErrors: this.errors
    }, null, 2));

    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new SentryErrorAnalyzer();
  analyzer.analyzeErrors().catch(console.error);
}

module.exports = SentryErrorAnalyzer;
