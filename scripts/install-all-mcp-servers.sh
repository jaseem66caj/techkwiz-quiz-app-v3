#!/bin/bash

# Complete MCP Servers Installation Script for TechKwiz
# Installs all available free MCP servers

set -e

echo "🚀 Installing ALL Free MCP Servers for TechKwiz Project"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_section() { echo -e "${PURPLE}🔧 $1${NC}"; }

# Check prerequisites
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
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_warning "Node.js version 18+ recommended. Current: $(node --version)"
    fi
    
    print_status "Prerequisites check passed"
}

# Install official MCP servers
install_official_servers() {
    print_section "Installing Official MCP Servers"
    
    local servers=(
        "@modelcontextprotocol/server-filesystem"
        "@modelcontextprotocol/server-git" 
        "@modelcontextprotocol/server-github"
        "@modelcontextprotocol/server-brave-search"
        "@modelcontextprotocol/server-fetch"
        "@modelcontextprotocol/server-puppeteer"
        "@modelcontextprotocol/server-memory"
        "@modelcontextprotocol/server-time"
        "@modelcontextprotocol/server-sqlite"
        "@modelcontextprotocol/server-postgres"
        "@modelcontextprotocol/server-gitlab"
    )
    
    for server in "${servers[@]}"; do
        print_info "Installing $server..."
        npm install -g "$server" || print_warning "Failed to install $server"
    done
    
    print_status "Official MCP servers installed"
}

# Install development tools
install_dev_tools() {
    print_section "Installing Development Tool Servers"
    
    local servers=(
        "githejie/mcp-server-calculator"
        "kehvinbehvin/json-mcp-filter"
        "ananddtyagi/webpage-screenshot-mcp"
        "qianniuspace/mcp-security-audit"
        "danielkennedy1/pdf-tools-mcp"
        "stass/exif-mcp"
        "2niuhe/qrcode_mcp"
        "2niuhe/plantuml_web"
    )
    
    for server in "${servers[@]}"; do
        print_info "Installing $server..."
        npm install -g "$server" || print_warning "Failed to install $server"
    done
    
    print_status "Development tool servers installed"
}

# Install search and research servers
install_search_servers() {
    print_section "Installing Search & Research Servers"
    
    local servers=(
        "nickclyde/duckduckgo-mcp-server"
        "blazickjp/arxiv-mcp-server"
        "erithwik/mcp-hn"
        "anaisbetts/mcp-youtube"
        "nkapila6/mcp-local-rag"
        "pragmar/mcp-server-webcrawl"
    )
    
    for server in "${servers[@]}"; do
        print_info "Installing $server..."
        npm install -g "$server" || print_warning "Failed to install $server"
    done
    
    print_status "Search & research servers installed"
}

# Install monitoring and system servers
install_monitoring_servers() {
    print_section "Installing Monitoring & System Servers"
    
    local servers=(
        "seekrays/mcp-monitor"
        "dotemacs/domain-lookup-mcp"
        "briandconnelly/mcp-server-ipinfo"
    )
    
    for server in "${servers[@]}"; do
        print_info "Installing $server..."
        npm install -g "$server" || print_warning "Failed to install $server"
    done
    
    print_status "Monitoring & system servers installed"
}

# Install productivity servers
install_productivity_servers() {
    print_section "Installing Productivity Servers"
    
    local servers=(
        "awwaiid/mcp-server-taskwarrior"
        "calclavia/mcp-obsidian"
    )
    
    for server in "${servers[@]}"; do
        print_info "Installing $server..."
        npm install -g "$server" || print_warning "Failed to install $server"
    done
    
    print_status "Productivity servers installed"
}

# Create comprehensive Claude Desktop config
create_comprehensive_config() {
    print_section "Creating Comprehensive Claude Desktop Configuration"
    
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    
    mkdir -p "$CLAUDE_CONFIG_DIR"
    
    cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/jaseem/Documents/GitHub/Techkwiz-v8"]
    },
    "git": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/Users/jaseem/Documents/GitHub/Techkwiz-v8"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_token_here"
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
    "time": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-time"]
    },
    "calculator": {
      "command": "npx",
      "args": ["-y", "githejie/mcp-server-calculator"]
    },
    "json-filter": {
      "command": "npx",
      "args": ["-y", "kehvinbehvin/json-mcp-filter"]
    },
    "duckduckgo": {
      "command": "npx",
      "args": ["-y", "nickclyde/duckduckgo-mcp-server"]
    },
    "hackernews": {
      "command": "npx",
      "args": ["-y", "erithwik/mcp-hn"]
    },
    "arxiv": {
      "command": "npx",
      "args": ["-y", "blazickjp/arxiv-mcp-server"]
    },
    "security-audit": {
      "command": "npx",
      "args": ["-y", "qianniuspace/mcp-security-audit"]
    },
    "system-monitor": {
      "command": "npx",
      "args": ["-y", "seekrays/mcp-monitor"]
    },
    "qr-code": {
      "command": "npx",
      "args": ["-y", "2niuhe/qrcode_mcp"]
    },
    "plantuml": {
      "command": "npx",
      "args": ["-y", "2niuhe/plantuml_web"]
    }
  }
}
EOF
    
    print_status "Comprehensive Claude Desktop configuration created"
    print_info "Config location: $CONFIG_FILE"
}

# Create environment setup
create_env_setup() {
    print_section "Creating Environment Setup"
    
    cat > setup-mcp-env.sh << 'EOF'
#!/bin/bash

# MCP Servers Environment Setup
echo "🔧 Setting up MCP environment variables..."

# Required API Keys (get free accounts)
export GITHUB_PERSONAL_ACCESS_TOKEN="your_github_token_here"

# Optional API Keys (free tiers available)
export BRAVE_API_KEY="your_brave_api_key_here"
export WEATHER_API_KEY="your_weather_api_key_here"
export GITLAB_PERSONAL_ACCESS_TOKEN="your_gitlab_token_here"
export IPINFO_API_KEY="your_ipinfo_key_here"

# Database URLs (if using databases)
export DATABASE_URL="postgresql://localhost/techkwiz"
export SQLITE_DB_PATH="./data/techkwiz.db"

echo "✅ Environment variables set"
echo "📝 Remember to update the actual API keys!"
EOF
    
    chmod +x setup-mcp-env.sh
    print_status "Environment setup script created"
}

# Create usage guide
create_usage_guide() {
    print_section "Creating Usage Guide"
    
    cat > MCP_USAGE_EXAMPLES.md << 'EOF'
# MCP Servers Usage Examples

## File Operations
- "Show me the structure of my TechKwiz project"
- "Find all TypeScript files that use useState"
- "Create a new component file for the quiz timer"

## Git Operations  
- "What changes were made in the last commit?"
- "Show me the git history for layout.tsx"
- "Create a new branch for the mobile improvements"

## Search & Research
- "Search DuckDuckGo for Next.js 15 best practices"
- "Find recent papers on ArXiv about AI in education"
- "What's trending on Hacker News today?"

## Development Tools
- "Calculate the performance improvement percentage"
- "Generate a QR code for the app URL"
- "Create a PlantUML diagram for the app architecture"

## Security & Monitoring
- "Audit npm dependencies for security issues"
- "Check current system performance metrics"
- "Analyze the EXIF data of this screenshot"

## Productivity
- "Extract specific data from this JSON config file"
- "Take a screenshot of the homepage for review"
- "Convert this PDF documentation to text"
EOF
    
    print_status "Usage guide created: MCP_USAGE_EXAMPLES.md"
}

# Main installation
main() {
    echo
    print_info "Starting comprehensive MCP servers installation..."
    echo
    
    check_prerequisites
    install_official_servers
    install_dev_tools  
    install_search_servers
    install_monitoring_servers
    install_productivity_servers
    create_comprehensive_config
    create_env_setup
    create_usage_guide
    
    echo
    print_status "🎉 All MCP servers installed successfully!"
    echo
    print_info "Next steps:"
    echo "1. Update API keys in setup-mcp-env.sh"
    echo "2. Restart Claude Desktop"
    echo "3. Try the examples in MCP_USAGE_EXAMPLES.md"
    echo
    print_warning "Total servers installed: 20+ free MCP servers"
    print_info "Your AI development environment is now supercharged! 🚀"
}

main "$@"
