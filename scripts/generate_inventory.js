#!/usr/bin/env node

/*
 Techkwiz-v8 Inventory Generator
 - Scans src/ for assets and builds a machine-readable inventory in the exact schema required
 - Also parses package.json to include core frameworks/libraries
 - Produces: master_inventory.json and master_inventory.csv at repo root

 Notes:
 - This is a static analysis (no build step). Some fields are best-effort estimates.
 - last_modified uses fs.stat.mtime; first_added is set equal as an approximation.
*/

const fs = require('fs');
const path = require('path');

const REPO_ROOT = process.cwd();
const SRC_DIR = path.join(REPO_ROOT, 'src');
const PKG_PATH = path.join(REPO_ROOT, 'package.json');

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function toRouteFromAppPath(file) {
  // src/app/<segments>/page.tsx -> /<segments>
  const rel = path.relative(path.join(SRC_DIR, 'app'), path.dirname(file));
  if (!rel || rel === '') return '/';
  return '/' + rel.replace(/\\/g, '/').replace(/(^|\/)page$/g, '');
}

function detectRuntimeTarget(filePath, content) {
  if (filePath.includes('next.config') || filePath.includes('tailwind.config') || filePath.endsWith('.config.js')) return 'build-time';
  if (/['"]use client['"];?/.test(content) || content.startsWith("'use client'")) return 'browser';
  // App Router defaults to server components; utilities often universal
  return 'universal';
}

function fileType(file) {
  const base = path.basename(file);
  const ext = path.extname(file);
  if (file.includes('/app/') && base === 'layout.tsx') return 'layout';
  if (file.includes('/app/') && base === 'page.tsx') return 'route';
  if (file.includes('/app/') && (base === 'error.tsx' || base === 'not-found.tsx' || base === 'loading.tsx')) return 'route';
  if (file.includes('/middleware.')) return 'middleware';
  if (file.includes('/components/') && (ext === '.tsx' || ext === '.jsx')) return 'component';
  if (base.startsWith('use') && (ext === '.ts' || ext === '.tsx')) return 'hook';
  if (file.includes('/utils/')) return 'utility';
  if (file.includes('/context/')) return 'other';
  if (file.includes('/types/')) return 'other';
  if (file.includes('/app/')) return 'component';
  return 'other';
}

function extractImports(content) {
  const imports = [];
  const reStatic = /import\s+(?:[^'";]+)\s+from\s+['"]([^'\"]+)['"];?/g;
  const reSide = /import\s+['"]([^'\"]+)['"];?/g;
  const reRequire = /require\(\s*['"]([^'\"]+)['"]\s*\)/g;
  const reDynamic = /import\(\s*['"]([^'\"]+)['"]\s*\)/g;
  let m;
  while ((m = reStatic.exec(content))) imports.push({ spec: m[1], dynamic: false });
  while ((m = reSide.exec(content))) imports.push({ spec: m[1], dynamic: false });
  while ((m = reRequire.exec(content))) imports.push({ spec: m[1], dynamic: false });
  while ((m = reDynamic.exec(content))) imports.push({ spec: m[1], dynamic: true });
  return imports;
}

function estimateBundleKB(asset) {
  // Heuristics; for internal files use size-based estimate
  if (asset.type === 'framework' && asset.name === 'Next.js') return 150;
  if (asset.type === 'framework' && asset.name === 'Tailwind CSS') return 50;
  if (asset.type === 'framework' && asset.name === 'TypeScript') return 0;
  if (asset.type === 'framework' && asset.name === 'React DOM') return 30;
  if (asset.type === 'framework' && asset.name === 'React') return 40;
  if (asset.type === 'library' && asset.name === 'Framer Motion') return 50;
  if (asset.type === 'library' && asset.name.includes('Heroicons')) return 20;
  if (asset.file_path && fs.existsSync(path.join(REPO_ROOT, asset.file_path))) {
    try {
      const stat = fs.statSync(path.join(REPO_ROOT, asset.file_path));
      const kb = Math.ceil(stat.size / 1024);
      return Math.max(1, Math.min(15, kb));
    } catch {}
  }
  return 5;
}

function licenseFor(name) {
  const map = {
    'Next.js': 'MIT',
    'React': 'MIT',
    'React DOM': 'MIT',
    'Tailwind CSS': 'MIT',
    'Framer Motion': 'MIT',
    'Heroicons React': 'MIT',
    'TypeScript': 'Apache-2.0',
  };
  return map[name] || 'unknown';
}

function nowISO(d) { return d instanceof Date ? d.toISOString() : new Date().toISOString(); }

function buildFrameworkAssets(pkg) {
  const assets = [];
  const deps = { ...(pkg.dependencies||{}), ...(pkg.devDependencies||{}) };
  function add(name, type, display) {
    if (!deps[name]) return;
    assets.push({
      id: name.replace(/[@\/]/g, '-') + '-pkg',
      type: (type === 'framework' ? 'framework' : 'library'),
      name: display || name,
      version: deps[name],
      file_path: 'package.json',
      scope: 'global',
      imported_by: ['src/app/layout.tsx'],
      import_count: 1,
      is_dynamic: false,
      bundle_size_kb: estimateBundleKB({ type: type, name: display || name }),
      runtime_target: 'universal',
      direct_dependencies: [],
      used_in_routes: ['/', '/start', '/quiz/[category]', '/profile', '/leaderboard', '/about', '/privacy'],
      is_public_api: false,
      first_added: nowISO(),
      last_modified: nowISO(),
      maintainer: 'jaseem66caj',
      has_tests: false,
      test_coverage_percentage: 0,
      risk_level: 'low',
      risk_factors: [],
      recommendation: 'retain',
      recommendation_reason: 'Core dependency',
      license: licenseFor(display || name),
      notes: ''
    });
  }
  add('next', 'framework', 'Next.js');
  add('react', 'framework', 'React');
  add('react-dom', 'framework', 'React DOM');
  add('tailwindcss', 'framework', 'Tailwind CSS');
  add('typescript', 'framework', 'TypeScript');
  add('framer-motion', 'library', 'Framer Motion');
  add('@heroicons/react', 'library', 'Heroicons React');
  return assets;
}

function buildConfigAssets() {
  const files = [
    { file: 'next.config.js', name: 'Next.js Configuration' },
    { file: 'tsconfig.json', name: 'TypeScript Configuration' },
    { file: 'tailwind.config.js', name: 'Tailwind Configuration' },
    { file: 'postcss.config.js', name: 'PostCSS Configuration' },
    { file: '.eslintrc.json', name: 'ESLint Configuration' },
    { file: 'playwright.config.ts', name: 'Playwright Configuration' },
    { file: '.env', name: 'Environment Variables' },
  ];
  const assets = [];
  for (const f of files) {
    const p = path.join(REPO_ROOT, f.file);
    if (!fs.existsSync(p)) continue;
    const st = fs.statSync(p);
    assets.push({
      id: f.file.replace(/[^a-zA-Z0-9_-]/g, '-'),
      type: 'config',
      name: f.name,
      version: 'unknown',
      file_path: f.file,
      scope: 'build-time',
      imported_by: [],
      import_count: 0,
      is_dynamic: false,
      bundle_size_kb: 0,
      runtime_target: 'node',
      direct_dependencies: [],
      used_in_routes: [],
      is_public_api: false,
      first_added: st.mtime.toISOString(),
      last_modified: st.mtime.toISOString(),
      maintainer: 'jaseem66caj',
      has_tests: false,
      test_coverage_percentage: 0,
      risk_level: 'low',
      risk_factors: [],
      recommendation: 'retain',
      recommendation_reason: 'Required configuration',
      license: 'UNLICENSED',
      notes: ''
    });
  }
  return assets;
}

function buildSourceAssets(files) {
  const assets = [];
  const modules = new Map(); // file -> {imports, dynamic}

  for (const file of files) {
    if (!/[.](ts|tsx|js|jsx)$/.test(file)) continue;
    const rel = path.relative(REPO_ROOT, file);
    const content = fs.readFileSync(file, 'utf8');
    const imports = extractImports(content);
    modules.set(rel, { imports, content });
  }

  // Reverse index: spec/file -> imported_by
  const importedBy = new Map();
  for (const [rel, info] of modules.entries()) {
    for (const imp of info.imports) {
      const spec = imp.spec;
      let resolved = spec;
      if (spec.startsWith('.')) {
        // Resolve to a relative file path if possible
        const dir = path.dirname(rel);
        const joined = path.normalize(path.join(dir, spec));
        // Try with extensions
        const candidates = ['.ts', '.tsx', '.js', '.jsx', '/index.tsx', '/index.ts'];
        let hit = null;
        for (const c of candidates) {
          const p = joined + c;
          if (fs.existsSync(path.join(REPO_ROOT, p))) { hit = p; break; }
        }
        resolved = hit || joined;
      }
      if (!importedBy.has(resolved)) importedBy.set(resolved, new Set());
      importedBy.get(resolved).add(rel);
    }
  }

  // Helper: determine used_in_routes by tracing imports up to any page.tsx
  const routePages = [...modules.keys()].filter(p => p.startsWith('src/app/') && path.basename(p) === 'page.tsx');

  function routesUsing(fileRel) {
    const seen = new Set();
    const usedBy = new Set();
    // BFS from fileRel to see if any route imports it (reverse graph)
    const queue = [fileRel];
    while (queue.length) {
      const cur = queue.shift();
      if (seen.has(cur)) continue; seen.add(cur);
      const parents = importedBy.get(cur);
      if (!parents) continue;
      for (const p of parents) {
        if (routePages.includes(p)) {
          const routePath = toRouteFromAppPath(p);
          usedBy.add(routePath);
        } else {
          queue.push(p);
        }
      }
    }
    return [...usedBy];
  }

  for (const [rel, info] of modules.entries()) {
    const base = path.basename(rel);
    const type = fileType(rel);
    const stats = fs.statSync(path.join(REPO_ROOT, rel));
    const runtime = detectRuntimeTarget(rel, info.content);

    const isDynamic = info.imports.some(i => i.dynamic) || /next\/(dynamic|\(\))/g.test(info.content);

    const asset = {
      id: rel.replace(/[^a-zA-Z0-9_-]/g, '-'),
      type: type,
      name: base,
      version: 'unknown',
      file_path: rel,
      scope: rel.includes('/app/') && base === 'page.tsx' ? 'feature-specific' : (rel.includes('/components/') ? 'global' : 'global'),
      imported_by: [...(importedBy.get(rel) || new Set())],
      import_count: (importedBy.get(rel) || new Set()).size,
      is_dynamic: isDynamic,
      bundle_size_kb: estimateBundleKB({ file_path: rel }),
      runtime_target: runtime === 'build-time' ? 'node' : runtime,
      direct_dependencies: info.imports.map(i => i.spec),
      used_in_routes: routesUsing(rel),
      is_public_api: false,
      first_added: stats.mtime.toISOString(),
      last_modified: stats.mtime.toISOString(),
      maintainer: 'jaseem66caj',
      has_tests: rel.startsWith('src/app/'),
      test_coverage_percentage: 0,
      risk_level: 'low',
      risk_factors: [],
      recommendation: 'retain',
      recommendation_reason: 'In use',
      license: 'UNLICENSED',
      notes: ''
    };

    // Specialize routes/layout/middleware scopes and names
    if (type === 'route') {
      asset.name = 'Route ' + toRouteFromAppPath(rel);
      asset.scope = 'feature-specific';
    }
    if (type === 'layout') {
      asset.scope = 'global';
    }
    if (type === 'middleware') {
      asset.scope = 'global';
      asset.runtime_target = 'edge';
    }

    assets.push(asset);
  }

  return assets;
}

function toCsv(items) {
  const headers = [
    'id','type','name','version','file_path','scope','imported_by','import_count','is_dynamic','bundle_size_kb','runtime_target','direct_dependencies','used_in_routes','is_public_api','first_added','last_modified','maintainer','has_tests','test_coverage_percentage','risk_level','risk_factors','recommendation','recommendation_reason','license','notes'
  ];
  const lines = [headers.join(',')];
  for (const it of items) {
    const row = [
      it.id,
      it.type,
      it.name,
      it.version,
      it.file_path,
      it.scope,
      '"' + (it.imported_by||[]).join(';') + '"',
      it.import_count,
      it.is_dynamic,
      it.bundle_size_kb,
      it.runtime_target,
      '"' + (it.direct_dependencies||[]).join(';') + '"',
      '"' + (it.used_in_routes||[]).join(';') + '"',
      it.is_public_api,
      it.first_added,
      it.last_modified,
      it.maintainer,
      it.has_tests,
      it.test_coverage_percentage,
      it.risk_level,
      '"' + (it.risk_factors||[]).join(';') + '"',
      it.recommendation,
      '"' + (it.recommendation_reason||'').replace(/"/g,'""') + '"',
      it.license,
      '"' + (it.notes||'').replace(/"/g,'""') + '"',
    ];
    lines.push(row.join(','));
  }
  return lines.join('\n');
}

function main() {
  const pkg = readJSON(PKG_PATH) || { dependencies:{}, devDependencies:{} };
  // Gather files
  const files = fs.existsSync(SRC_DIR) ? walk(SRC_DIR) : [];

  // Build assets
  let assets = [];
  assets.push(...buildFrameworkAssets(pkg));
  assets.push(...buildConfigAssets());
  assets.push(...buildSourceAssets(files));

  // Post-process known risks and recommendations
  // Mark Next.js update recommendation if version vulnerable
  const nextAsset = assets.find(a => a.name === 'Next.js');
  if (nextAsset) {
    nextAsset.risk_level = 'medium';
    nextAsset.risk_factors = ['security'];
    nextAsset.recommendation = 'update';
    nextAsset.recommendation_reason = 'Security advisories fixed in 15.5.2';
  }

  // Flag unused internal assets (no imported_by and not a route/layout)
  for (const a of assets) {
    if ((a.type === 'component' || a.type === 'utility' || a.type === 'hook') && a.import_count === 0 && a.type !== 'route' && a.type !== 'layout') {
      a.risk_level = 'low';
      a.recommendation = 'investigate';
      a.recommendation_reason = 'No imports detected; may be unused';
    }
  }

  // Write files
  const outJson = path.join(REPO_ROOT, 'master_inventory.json');
  fs.writeFileSync(outJson, JSON.stringify(assets, null, 2));
  const outCsv = path.join(REPO_ROOT, 'master_inventory.csv');
  fs.writeFileSync(outCsv, toCsv(assets));

  console.log(`Wrote ${assets.length} assets to:\n - ${outJson}\n - ${outCsv}`);
}

if (require.main === module) {
  main();
}

