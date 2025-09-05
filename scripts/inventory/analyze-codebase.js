#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively read directory
function readDirRecursive(dirPath) {
  let results = [];
  const list = fs.readdirSync(dirPath);
  
  list.forEach((file) => {
    file = path.resolve(dirPath, file);
    const stat = fs.statSync(file);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(readDirRecursive(file));
    } else {
      results.push(file);
    }
  });
  
  return results;
}

// Function to get import statements from a file
function getImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  
  // Match import statements
  const importRegex = /import\s+(?:(?:{[^}]+}|\w+|\*\s+as\s+\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  // Match dynamic imports
  const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  // Match require statements
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

// Function to analyze a file
function analyzeFile(filePath) {
  const ext = path.extname(filePath);
  
  // Only analyze JavaScript/TypeScript files
  if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    return null;
  }
  
  const relativePath = path.relative(process.cwd(), filePath);
  const fileName = path.basename(filePath);
  
  // Get imports
  const imports = getImports(filePath);
  
  // Determine if it's a component, hook, utility, etc.
  let type = 'other';
  if (fileName.includes('.tsx') || fileName.includes('.jsx')) {
    if (fileName.startsWith('use')) {
      type = 'hook';
    } else if (fileName.includes('Context') || fileName.includes('Provider')) {
      type = 'context';
    } else {
      type = 'component';
    }
  } else if (fileName.includes('.ts') || fileName.includes('.js')) {
    if (fileName.startsWith('use')) {
      type = 'hook';
    } else if (fileName.includes('Context') || fileName.includes('Provider')) {
      type = 'context';
    } else {
      type = 'util';
    }
  }
  
  return {
    path: relativePath,
    type,
    imports,
    name: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
  };
}

// Function to analyze the entire codebase
function analyzeCodebase() {
  const srcPath = path.join(__dirname, '../../frontend/src');
  const files = readDirRecursive(srcPath);
  
  const analysis = [];
  
  files.forEach((file) => {
    const result = analyzeFile(file);
    if (result) {
      analysis.push(result);
    }
  });
  
  return analysis;
}

// Function to generate inventory from analysis
function generateInventory(analysis) {
  const inventory = [];
  
  // Group by type
  const components = analysis.filter(item => item.type === 'component');
  const hooks = analysis.filter(item => item.type === 'hook');
  const utils = analysis.filter(item => item.type === 'util');
  const contexts = analysis.filter(item => item.type === 'context');
  
  // Process components
  components.forEach(component => {
    inventory.push({
      id: component.name.toLowerCase().replace(/\s+/g, '-') + '-component',
      type: 'component',
      name: component.name,
      version: '1.0.0',
      path: component.path,
      scope: component.path.includes('app/') ? 'page-specific' : 'global',
      consumers: [],
      import_count: 0,
      dynamic_load: component.imports.some(imp => imp.includes('import(')),
      bundle_impact: { parsed_kb: 0, gzipped_kb: 0, client_server: 'client' },
      runtime: 'browser',
      deps: component.imports.filter(imp => !imp.startsWith('.')),
      used_by_routes: [],
      public_api: false,
      first_seen: '2024-01-01',
      last_changed: '2024-06-01',
      owners: 'frontend-team',
      tests_present: false,
      risk: 'none',
      action: 'retain',
      action_reason: 'Component in use'
    });
  });
  
  // Process hooks
  hooks.forEach(hook => {
    inventory.push({
      id: hook.name.toLowerCase().replace(/\s+/g, '-') + '-hook',
      type: 'hook',
      name: hook.name,
      version: '1.0.0',
      path: hook.path,
      scope: hook.path.includes('app/') ? 'page-specific' : 'global',
      consumers: [],
      import_count: 0,
      dynamic_load: hook.imports.some(imp => imp.includes('import(')),
      bundle_impact: { parsed_kb: 0, gzipped_kb: 0, client_server: 'client' },
      runtime: 'browser',
      deps: hook.imports.filter(imp => !imp.startsWith('.')),
      used_by_routes: [],
      public_api: false,
      first_seen: '2024-01-01',
      last_changed: '2024-06-01',
      owners: 'frontend-team',
      tests_present: false,
      risk: 'none',
      action: 'retain',
      action_reason: 'Hook in use'
    });
  });
  
  // Process utilities
  utils.forEach(util => {
    inventory.push({
      id: util.name.toLowerCase().replace(/\s+/g, '-') + '-util',
      type: 'util',
      name: util.name,
      version: '1.0.0',
      path: util.path,
      scope: util.path.includes('app/') ? 'page-specific' : 'global',
      consumers: [],
      import_count: 0,
      dynamic_load: util.imports.some(imp => imp.includes('import(')),
      bundle_impact: { parsed_kb: 0, gzipped_kb: 0, client_server: 'client' },
      runtime: 'browser',
      deps: util.imports.filter(imp => !imp.startsWith('.')),
      used_by_routes: [],
      public_api: false,
      first_seen: '2024-01-01',
      last_changed: '2024-06-01',
      owners: 'frontend-team',
      tests_present: false,
      risk: 'none',
      action: 'retain',
      action_reason: 'Utility in use'
    });
  });
  
  return inventory;
}

// Main execution
function main() {
  console.log('Analyzing codebase...');
  
  const analysis = analyzeCodebase();
  console.log(`Found ${analysis.length} files to analyze`);
  
  const inventory = generateInventory(analysis);
  console.log(`Generated inventory with ${inventory.length} items`);
  
  // Save to file
  const outputPath = path.join(__dirname, '../../master_inventory_generated.json');
  fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));
  
  console.log(`Inventory saved to: ${outputPath}`);
}

// Run the analysis
main();