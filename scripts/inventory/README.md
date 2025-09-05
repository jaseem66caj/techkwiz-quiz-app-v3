# Techkwiz-v8 Inventory Scripts

This directory contains scripts for analyzing and generating inventory reports for the Techkwiz-v8 codebase.

## Scripts Overview

### 1. Codebase Analysis Script
- **File**: [analyze-codebase.js](file:///Users/jaseem/Documents/GitHub/Techkwiz-v8/scripts/inventory/analyze-codebase.js)
- **Purpose**: Analyzes the frontend codebase to identify components, hooks, utilities, and their dependencies
- **Output**: Generates a JSON inventory file with basic metadata

### 2. CSV Generation Script
- **File**: [generate-csv.js](file:///Users/jaseem/Documents/GitHub/Techkwiz-v8/scripts/inventory/generate-csv.js)
- **Purpose**: Converts the JSON inventory to CSV format for easier analysis in spreadsheets
- **Output**: Generates a CSV file with all inventory data

### 3. Dependency Graph Generator
- **File**: [generate-dependency-graphs.js](file:///Users/jaseem/Documents/GitHub/Techkwiz-v8/scripts/inventory/generate-dependency-graphs.js)
- **Purpose**: Generates Mermaid diagrams showing dependency relationships
- **Output**: Creates Mermaid diagram files for visualization

## Usage Instructions

### Prerequisites
Make sure you have Node.js installed on your system.

### Running the Analysis

1. **Analyze the codebase**:
   ```bash
   cd /path/to/techkwiz-v8
   node scripts/inventory/analyze-codebase.js
   ```
   This will generate `master_inventory_generated.json` in the root directory.

2. **Generate CSV version**:
   ```bash
   node scripts/inventory/generate-csv.js
   ```
   This will generate `master_inventory_generated.csv` in the root directory.

3. **Generate dependency graphs**:
   ```bash
   node scripts/inventory/generate-dependency-graphs.js
   ```
   This will generate Mermaid diagram files in the `dependency-graphs` directory.

## Output Files

The scripts generate the following files:

- `master_inventory_generated.json` - Complete inventory in JSON format
- `master_inventory_generated.csv` - Complete inventory in CSV format
- `dependency-graphs/` - Directory containing Mermaid diagram files

## Customization

You can modify the scripts to:
- Change the analysis criteria
- Add additional metadata fields
- Adjust the output format
- Include additional file types in the analysis

## Visualization

To visualize the dependency graphs:
1. Copy the contents of any `.mmd` file
2. Paste it into the [Mermaid Live Editor](https://mermaid.live/edit)
3. View the generated diagram

## Maintenance

These scripts should be updated when:
- New component types are added to the codebase
- The directory structure changes significantly
- New metadata fields are needed in the inventory