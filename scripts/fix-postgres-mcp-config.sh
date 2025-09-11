#!/bin/bash

# Fix Postgres MCP Configuration Script
# This script fixes the Claude Desktop configuration for the postgres MCP server

echo "🔧 Fixing Postgres MCP Configuration"
echo "================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Main function
main() {
    echo
    print_info "Analyzing Postgres MCP Configuration..."
    echo
    
    # Claude Desktop config directory
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    
    # Check if config directory exists
    if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
        print_info "Creating Claude Desktop config directory..."
        mkdir -p "$CLAUDE_CONFIG_DIR"
    fi
    
    # Check if config file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        print_info "Creating Claude Desktop configuration file..."
        cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/jaseem/Documents/GitHub/techkwiz-quiz-app-v2"
      ],
      "env": {},
      "disabled": false
    },
    "memory": {
      "command": "npx", 
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ],
      "env": {},
      "disabled": false
    }
  },
  "defaults": {
    "disabled": false
  }
}
EOF
    fi
    
    # Backup existing config
    print_info "Backing up existing configuration..."
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    print_status "Backup created"
    
    # Check if postgres server is already configured
    if grep -q "server-postgres" "$CONFIG_FILE"; then
        print_info "Postgres server is already configured"
        
        # Check if the database URL is correct
        if grep -q "postgresql://localhost/techkwiz" "$CONFIG_FILE"; then
            print_status "Postgres server configuration is correct"
        else
            print_info "Updating postgres server database URL..."
            # Update the database URL
            sed -i '' 's|"postgresql://[^"]*"|"postgresql://localhost/techkwiz"|' "$CONFIG_FILE"
            print_status "Postgres server database URL updated"
        fi
    else
        print_info "Adding postgres server to configuration..."
        
        # Add postgres server configuration
        # First, add a comma after the last server
        sed -i '' '/"memory"/,/}/s/}/},/' "$CONFIG_FILE"
        
        # Then add the postgres server configuration
        sed -i '' '/"memory"/a\
    "postgres": {\
      "command": "npx",\
      "args": [\
        "-y",\
        "@modelcontextprotocol/server-postgres"\
      ],\
      "env": {\
        "DATABASE_URL": "postgresql://localhost/techkwiz"\
      },\
      "disabled": false\
    }\
' "$CONFIG_FILE"
        
        print_status "Postgres server added to configuration"
    fi
    
    # Verify the configuration
    print_info "Verifying configuration..."
    if python3 -m json.tool "$CONFIG_FILE" >/dev/null 2>&1; then
        print_status "Configuration is valid JSON"
        print_info "Current configuration:"
        cat "$CONFIG_FILE" | python3 -m json.tool
    else
        print_error "Configuration is not valid JSON"
        print_info "Restoring backup..."
        cp "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)" "$CONFIG_FILE"
        exit 1
    fi
    
    echo
    print_info "Restarting Claude Desktop..."
    
    # Restart Claude Desktop
    if pgrep -f "Claude" > /dev/null; then
        print_info "Stopping Claude Desktop..."
        osascript -e 'tell application "Claude" to quit' 2>/dev/null
        sleep 3
        killall -9 "Claude" 2>/dev/null || true
        sleep 2
    fi
    
    print_info "Starting Claude Desktop..."
    open -a Claude
    sleep 8
    
    echo
    print_status "✅ Postgres MCP Configuration Fixed!"
    print_info "Next steps:"
    print_info "1. In Claude Desktop, try asking:"
    print_info "   - 'Can you store this information in a database?'"
    print_info "   - 'What can you do with the postgres server?'"
    print_info "2. The postgres MCP server should now work correctly"
}

main "$@"