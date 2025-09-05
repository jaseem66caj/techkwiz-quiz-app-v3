#!/bin/bash

# MCP Configuration Manager
# Manage Claude Desktop MCP server configurations

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
BACKUP_DIR="$HOME/Library/Application Support/Claude/backups"

print_header() { echo -e "${PURPLE}🔧 $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

show_usage() {
    echo "MCP Configuration Manager"
    echo "========================"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  show          Show current MCP configuration"
    echo "  backup        Create backup of current configuration"
    echo "  restore       Restore from backup"
    echo "  validate      Validate configuration syntax"
    echo "  add-server    Add a new MCP server"
    echo "  remove-server Remove an MCP server"
    echo "  list-servers  List available MCP servers"
    echo "  reset         Reset to default configuration"
    echo "  help          Show this help message"
}

show_config() {
    print_header "Current MCP Configuration"
    
    if [ -f "$CONFIG_FILE" ]; then
        print_info "Location: $CONFIG_FILE"
        echo ""
        cat "$CONFIG_FILE" | python3 -m json.tool
        echo ""
        
        # Show active servers
        print_info "Active MCP Servers:"
        jq -r '.mcpServers | keys[]' "$CONFIG_FILE" 2>/dev/null | while read server; do
            echo "  • $server"
        done
    else
        print_error "Configuration file not found: $CONFIG_FILE"
    fi
}

backup_config() {
    print_header "Creating Configuration Backup"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "No configuration file to backup"
        return 1
    fi
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/claude_desktop_config_$(date +%Y%m%d_%H%M%S).json"
    
    cp "$CONFIG_FILE" "$BACKUP_FILE"
    print_success "Backup created: $BACKUP_FILE"
}

validate_config() {
    print_header "Validating Configuration"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Configuration file not found"
        return 1
    fi
    
    if python3 -m json.tool "$CONFIG_FILE" >/dev/null 2>&1; then
        print_success "Configuration syntax is valid"
        
        # Check for required fields
        if jq -e '.mcpServers' "$CONFIG_FILE" >/dev/null 2>&1; then
            print_success "mcpServers section found"
            
            SERVER_COUNT=$(jq '.mcpServers | length' "$CONFIG_FILE")
            print_info "Number of configured servers: $SERVER_COUNT"
        else
            print_warning "mcpServers section missing"
        fi
    else
        print_error "Invalid JSON syntax in configuration"
        return 1
    fi
}

list_available_servers() {
    print_header "Available MCP Servers"
    
    echo "Official Servers:"
    echo "  • @modelcontextprotocol/server-filesystem - File system access"
    echo "  • @modelcontextprotocol/server-memory - Persistent memory"
    echo "  • @modelcontextprotocol/server-sequential-thinking - Advanced reasoning"
    echo ""
    echo "Community Servers:"
    echo "  • puppeteer-mcp-server - Browser automation"
    echo "  • mcp-smart-crawler - Web crawling"
    echo "  • @anaisbetts/mcp-youtube - YouTube transcripts"
    echo "  • nickclyde/duckduckgo-mcp-server - Web search"
    echo ""
    echo "For more servers, visit: https://github.com/punkpeye/awesome-mcp-servers"
}

add_server() {
    print_header "Add MCP Server"
    
    echo "Enter server details:"
    read -p "Server name (e.g., 'github'): " SERVER_NAME
    read -p "Package name (e.g., '@modelcontextprotocol/server-github'): " PACKAGE_NAME
    read -p "Additional arguments (optional): " ARGS
    
    if [ -z "$SERVER_NAME" ] || [ -z "$PACKAGE_NAME" ]; then
        print_error "Server name and package name are required"
        return 1
    fi
    
    # Create backup first
    backup_config
    
    # Add server to config
    TEMP_CONFIG=$(mktemp)
    
    if [ -n "$ARGS" ]; then
        jq --arg name "$SERVER_NAME" --arg pkg "$PACKAGE_NAME" --arg args "$ARGS" \
           '.mcpServers[$name] = {"command": "npx", "args": ["-y", $pkg] + ($args | split(" "))}' \
           "$CONFIG_FILE" > "$TEMP_CONFIG"
    else
        jq --arg name "$SERVER_NAME" --arg pkg "$PACKAGE_NAME" \
           '.mcpServers[$name] = {"command": "npx", "args": ["-y", $pkg]}' \
           "$CONFIG_FILE" > "$TEMP_CONFIG"
    fi
    
    mv "$TEMP_CONFIG" "$CONFIG_FILE"
    print_success "Server '$SERVER_NAME' added to configuration"
    print_warning "Restart Claude Desktop to apply changes"
}

remove_server() {
    print_header "Remove MCP Server"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Configuration file not found"
        return 1
    fi
    
    echo "Current servers:"
    jq -r '.mcpServers | keys[]' "$CONFIG_FILE" | nl
    echo ""
    
    read -p "Enter server name to remove: " SERVER_NAME
    
    if [ -z "$SERVER_NAME" ]; then
        print_error "Server name is required"
        return 1
    fi
    
    # Check if server exists
    if ! jq -e ".mcpServers[\"$SERVER_NAME\"]" "$CONFIG_FILE" >/dev/null 2>&1; then
        print_error "Server '$SERVER_NAME' not found in configuration"
        return 1
    fi
    
    # Create backup first
    backup_config
    
    # Remove server
    TEMP_CONFIG=$(mktemp)
    jq --arg name "$SERVER_NAME" 'del(.mcpServers[$name])' "$CONFIG_FILE" > "$TEMP_CONFIG"
    mv "$TEMP_CONFIG" "$CONFIG_FILE"
    
    print_success "Server '$SERVER_NAME' removed from configuration"
    print_warning "Restart Claude Desktop to apply changes"
}

reset_config() {
    print_header "Reset to Default Configuration"
    
    print_warning "This will replace your current configuration with the default TechKwiz setup"
    read -p "Are you sure? (y/N): " CONFIRM
    
    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
        print_info "Reset cancelled"
        return 0
    fi
    
    # Create backup first
    if [ -f "$CONFIG_FILE" ]; then
        backup_config
    fi
    
    # Create default configuration
    mkdir -p "$(dirname "$CONFIG_FILE")"
    cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/jaseem/Documents/GitHub/Techkwiz-v8"
      ]
    },
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    }
  }
}
EOF
    
    print_success "Configuration reset to default"
    print_warning "Restart Claude Desktop to apply changes"
}

# Main command handling
case "${1:-show}" in
    "show"|"config"|"current")
        show_config
        ;;
    "backup")
        backup_config
        ;;
    "validate"|"check")
        validate_config
        ;;
    "list"|"list-servers"|"available")
        list_available_servers
        ;;
    "add"|"add-server")
        add_server
        ;;
    "remove"|"remove-server"|"delete")
        remove_server
        ;;
    "reset"|"default")
        reset_config
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
