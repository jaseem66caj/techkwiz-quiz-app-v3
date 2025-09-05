#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the inventory data
const inventoryPath = path.join(__dirname, '../../master_inventory_updated.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

// Function to convert JSON to CSV
function jsonToCsv(jsonData) {
  // Define the headers
  const headers = [
    'id', 'type', 'name', 'version', 'path', 'scope', 'consumers', 'import_count',
    'dynamic_load', 'bundle_impact_parsed_kb', 'bundle_impact_gzipped_kb',
    'bundle_impact_client_server', 'runtime', 'deps', 'used_by_routes', 'public_api',
    'first_seen', 'last_changed', 'owners', 'tests_present', 'risk', 'action', 'action_reason'
  ];
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Process each item
  jsonData.forEach(item => {
    const row = [
      item.id,
      item.type,
      item.name,
      item.version,
      item.path,
      item.scope,
      `"${Array.isArray(item.consumers) ? item.consumers.join(', ') : item.consumers}"`,
      item.import_count,
      item.dynamic_load,
      item.bundle_impact.parsed_kb,
      item.bundle_impact.gzipped_kb,
      item.bundle_impact.client_server,
      item.runtime,
      `"${Array.isArray(item.deps) ? item.deps.join(', ') : item.deps}"`,
      `"${Array.isArray(item.used_by_routes) ? item.used_by_routes.join(', ') : item.used_by_routes}"`,
      item.public_api,
      item.first_seen,
      item.last_changed,
      item.owners,
      item.tests_present,
      item.risk,
      item.action,
      `"${item.action_reason}"`
    ];
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

// Generate CSV
const csvData = jsonToCsv(inventory);

// Write to file
const outputPath = path.join(__dirname, '../../master_inventory_generated.csv');
fs.writeFileSync(outputPath, csvData);

console.log(`CSV inventory generated and saved to: ${outputPath}`);