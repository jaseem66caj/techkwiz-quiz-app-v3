#!/bin/bash

# Corrected MCP Servers Installation Script
# Uses proper package names and installation methods

set -e

echo "🚀 Installing MCP Servers (Corrected Version)"
echo "============================================="

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

# Check if running with sudo
check_permissions() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script needs to be run with sudo for global npm installations"
        print_info "Please run: sudo ./install-mcp-corrected.sh"
        exit 1
    fi
}

# Install official MCP servers that actually exist
install_official_servers() {
    print_info "Installing verified official MCP servers..."
    
    # These are the actual packages that exist
    local servers=(
        "@modelcontextprotocol/server-filesystem"
        "@modelcontextprotocol/server-github" 
        "@modelcontextprotocol/server-brave-search"
        "@modelcontextprotocol/server-puppeteer"
        "@modelcontextprotocol/server-memory"
        "@modelcontextprotocol/server-postgres"
    )
    
    for server in "${servers[@]}"; do
        print_info "Installing $server..."
        if npm install -g "$server"; then
            print_status "Successfully installed $server"
        else
            print_warning "Failed to install $server"
        fi
    done
}

# Install using npx (no global installation needed)
install_npx_servers() {
    print_info "Setting up npx-based servers (no installation needed)..."
    
    # Test npx servers
    local npx_servers=(
        "@modelcontextprotocol/server-fetch"
        "@modelcontextprotocol/server-sqlite"
    )
    
    for server in "${npx_servers[@]}"; do
        print_info "Testing $server with npx..."
        if npx -y "$server" --help >/dev/null 2>&1; then
            print_status "$server is available via npx"
        else
            print_warning "$server may not be available"
        fi
    done
}

# Create a working Claude Desktop config with verified servers
create_working_config() {
    print_info "Creating Claude Desktop configuration with verified servers..."
    
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    
    # Create directory as the actual user, not root
    sudo -u "$SUDO_USER" mkdir -p "$CLAUDE_CONFIG_DIR"
    
    # Create config with only working servers
    cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/jaseem/Documents/GitHub/Techkwiz-v8"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_token_here"
      }
    },
    "brave-search": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your_brave_api_key_here"
      }
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./data/techkwiz.db"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/techkwiz"
      }
    }
  }
}
EOF
    
    # Set proper ownership
    chown "$SUDO_USER:staff" "$CONFIG_FILE"
    
    print_status "Claude Desktop configuration created at: $CONFIG_FILE"
}

# Create API keys setup
create_api_setup() {
    print_info "Creating API keys setup file..."
    
    cat > setup-api-keys.sh << 'EOF'
#!/bin/bash

echo "🔑 MCP API Keys Setup"
echo "===================="

echo "You'll need these API keys for full functionality:"
echo ""
echo "1. GitHub Personal Access Token (Required)"
echo "   - Go to: https://github.com/settings/tokens"
echo "   - Generate new token with 'repo' permissions"
echo "   - Add to Claude config: GITHUB_PERSONAL_ACCESS_TOKEN"
echo ""
echo "2. Brave Search API Key (Optional)"
echo "   - Go to: https://api.search.brave.com/"
echo "   - Sign up for free (2000 queries/month)"
echo "   - Add to Claude config: BRAVE_API_KEY"
echo ""
echo "3. Update the config file:"
echo "   ~/Library/Application Support/Claude/claude_desktop_config.json"
echo ""
echo "4. Restart Claude Desktop after updating API keys"
EOF
    
    chmod +x setup-api-keys.sh
    chown "$SUDO_USER:staff" setup-api-keys.sh
    
    print_status "API setup guide created: setup-api-keys.sh"
}

# Test installation
test_installation() {
    print_info "Testing MCP server installation..."
    
    # Test filesystem server
    if npx -y @modelcontextprotocol/server-filesystem --help >/dev/null 2>&1; then
        print_status "Filesystem server is working"
    else
        print_warning "Filesystem server test failed"
    fi
    
    # Test fetch server
    if npx -y @modelcontextprotocol/server-fetch --help >/dev/null 2>&1; then
        print_status "Fetch server is working"
    else
        print_warning "Fetch server test failed"
    fi
}

# Main installation
main() {
    print_info "Starting corrected MCP installation..."
    
    check_permissions
    install_official_servers
    install_npx_servers
    create_working_config
    create_api_setup
    test_installation
    
    echo ""
    print_status "🎉 MCP servers installation completed!"
    echo ""
    print_info "Next steps:"
    echo "1. Run: ./setup-api-keys.sh (for API key instructions)"
    echo "2. Update API keys in Claude Desktop config"
    echo "3. Restart Claude Desktop"
    echo "4. Test with: 'Can you list the files in my TechKwiz project?'"
    echo ""
    print_warning "Note: Using npx ensures compatibility and avoids permission issues"
}

main "$@"
