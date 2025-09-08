#!/bin/bash

# TechKwiz MCP Servers Installation Script
# This script installs and configures MCP servers for your development workflow

set -e

echo "🚀 Installing MCP Servers for TechKwiz Project"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js and npm are installed
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "Node.js and npm are installed"
}

# Install core MCP servers
install_core_servers() {
    print_info "Installing core MCP servers..."
    
    # Official MCP servers
    npm install -g @modelcontextprotocol/server-filesystem
    npm install -g @modelcontextprotocol/server-git
    npm install -g @modelcontextprotocol/server-github
    npm install -g @modelcontextprotocol/server-brave-search
    npm install -g @modelcontextprotocol/server-fetch
    npm install -g @modelcontextprotocol/server-puppeteer
    npm install -g @modelcontextprotocol/server-memory
    npm install -g @modelcontextprotocol/server-time
    
    print_status "Core MCP servers installed"
}

# Install development-specific servers
install_dev_servers() {
    print_info "Installing development-specific MCP servers..."
    
    # Development tools
    npm install -g githejie/mcp-server-calculator
    npm install -g kehvinbehvin/json-mcp-filter
    npm install -g ananddtyagi/webpage-screenshot-mcp
    
    print_status "Development MCP servers installed"
}

# Create Claude Desktop configuration
setup_claude_config() {
    print_info "Setting up Claude Desktop configuration..."
    
    # Claude Desktop config directory
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    
    # Create directory if it doesn't exist
    mkdir -p "$CLAUDE_CONFIG_DIR"
    
    # Copy our configuration
    if [ -f "claude_desktop_config.json" ]; then
        cp claude_desktop_config.json "$CONFIG_FILE"
        print_status "Claude Desktop configuration updated"
        print_warning "Please update API keys in: $CONFIG_FILE"
    else
        print_error "claude_desktop_config.json not found in current directory"
    fi
}

# Create environment setup script
create_env_script() {
    print_info "Creating environment setup script..."
    
    cat > setup-mcp-env.sh << 'EOF'
#!/bin/bash

# Environment setup for MCP servers
# Add your API keys here

export GITHUB_PERSONAL_ACCESS_TOKEN="your_github_token_here"
export BRAVE_API_KEY="your_brave_api_key_here"

# Optional: Add other API keys as needed
# export OPENAI_API_KEY="your_openai_key_here"
# export ANTHROPIC_API_KEY="your_anthropic_key_here"

echo "MCP environment variables set"
EOF
    
    chmod +x setup-mcp-env.sh
    print_status "Environment setup script created: setup-mcp-env.sh"
}

# Create test script
create_test_script() {
    print_info "Creating MCP test script..."
    
    cat > test-mcp-servers.sh << 'EOF'
#!/bin/bash

# Test MCP servers functionality
echo "🧪 Testing MCP Servers"
echo "====================="

# Test filesystem server
echo "Testing filesystem server..."
npx @modelcontextprotocol/server-filesystem --help

# Test git server
echo "Testing git server..."
npx @modelcontextprotocol/server-git --help

# Test fetch server
echo "Testing fetch server..."
npx @modelcontextprotocol/server-fetch --help

echo "✅ MCP servers test completed"
EOF
    
    chmod +x test-mcp-servers.sh
    print_status "Test script created: test-mcp-servers.sh"
}

# Main installation process
main() {
    echo
    print_info "Starting MCP servers installation for TechKwiz..."
    echo
    
    check_prerequisites
    install_core_servers
    install_dev_servers
    setup_claude_config
    create_env_script
    create_test_script
    
    echo
    print_status "🎉 MCP servers installation completed!"
    echo
    print_info "Next steps:"
    echo "1. Update API keys in setup-mcp-env.sh"
    echo "2. Update Claude Desktop config: ~/Library/Application Support/Claude/claude_desktop_config.json"
    echo "3. Restart Claude Desktop"
    echo "4. Run ./test-mcp-servers.sh to verify installation"
    echo
    print_warning "Remember to keep your API keys secure and never commit them to version control!"
}

# Run main function
main "$@"
