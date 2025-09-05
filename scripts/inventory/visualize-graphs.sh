#!/bin/bash

# Script to visualize dependency graphs using Mermaid CLI (if available)
# or provide instructions for manual visualization

echo "Techkwiz-v8 Dependency Graph Visualization"
echo "========================================="

# Check if mermaid CLI is installed
if command -v mmdc &> /dev/null
then
    echo "Mermaid CLI found. Generating PNG images..."
    
    # Create output directory
    mkdir -p ../dependency-graphs/png
    
    # Convert each mermaid file to PNG
    for file in ../dependency-graphs/*.mmd; do
        if [ -f "$file" ]; then
            filename=$(basename "$file" .mmd)
            echo "Generating PNG for $filename..."
            mmdc -i "$file" -o "../dependency-graphs/png/$filename.png"
        fi
    done
    
    echo "PNG images generated in dependency-graphs/png/"
else
    echo "Mermaid CLI not found. Please install it using:"
    echo "npm install -g @mermaid-js/mermaid-cli"
    echo ""
    echo "Alternatively, you can manually visualize the graphs by:"
    echo "1. Going to https://mermaid.live/edit"
    echo "2. Copying the content of any .mmd file from dependency-graphs/"
    echo "3. Pasting it into the editor"
    echo "4. Viewing the generated diagram"
fi

echo ""
echo "Graph files available:"
ls -la ../dependency-graphs/