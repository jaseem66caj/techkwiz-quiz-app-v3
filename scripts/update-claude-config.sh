#!/bin/bash

# Update Claude Desktop Configuration Script
echo "🔧 Updating Claude Desktop Configuration"

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
    print_info "Updating Claude Desktop Configuration..."
    echo
    
    # Claude Desktop config directory
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    
    # Check if config directory exists
    if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
        print_info "Creating Claude Desktop config directory..."
        mkdir -p "$CLAUDE_CONFIG_DIR"
    fi
    
    # Backup existing config if it exists
    if [ -f "$CONFIG_FILE" ]; then
        print_info "Backing up existing configuration..."
        cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        print_status "Backup created"
    fi
    
    # Copy the updated configuration
    print_info "Copying updated configuration..."
    cp "/Users/jaseem/Documents/GitHub/techkwiz-quiz-app-v2/claude_desktop_config_updated.json" "$CONFIG_FILE"
    
    # Verify the copy
    if [ -f "$CONFIG_FILE" ]; then
        print_status "Claude Desktop configuration updated successfully!"
        print_info "Configuration location: $CONFIG_FILE"
        echo
        print_info "Current configuration:"
        cat "$CONFIG_FILE" | python3 -m json.tool
    else
        print_error "Failed to update Claude Desktop configuration"
        exit 1
    fi
    
    echo
    print_info "Restart Claude Desktop to apply changes"
    print_info "You can do this by:"
    print_info "1. Quitting Claude Desktop (Cmd+Q)"
    print_info "2. Reopening Claude Desktop"
    echo
    print_warning "Note: The postgres server requires a PostgreSQL database to be set up"
    print_info "If you don't have PostgreSQL installed, you can:"
    print_info "1. Install PostgreSQL: brew install postgresql"
    print_info "2. Or remove the postgres section from the configuration"
    echo
    print_status "🎉 Configuration update completed!"
}

main "$@"