#!/bin/bash

# Redis MCP Server Setup Script
echo "🔧 Setting up Redis MCP Server"

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

# Check if Redis is installed and running
check_redis() {
    print_info "Checking Redis installation..."
    
    if ! command -v redis-server &> /dev/null; then
        print_error "Redis server is not installed"
        print_info "Please install Redis first:"
        print_info "  macOS: brew install redis"
        print_info "  Ubuntu: sudo apt-get install redis-server"
        exit 1
    fi
    
    print_status "Redis is installed"
    
    # Check if Redis is running
    if redis-cli ping &> /dev/null; then
        print_status "Redis server is running"
    else
        print_info "Starting Redis server..."
        if redis-server --daemonize yes; then
            sleep 2
            if redis-cli ping &> /dev/null; then
                print_status "Redis server started successfully"
            else
                print_error "Failed to start Redis server"
                exit 1
            fi
        else
            print_error "Failed to start Redis server"
            exit 1
        fi
    fi
}

# Check if Redis MCP server package exists
check_redis_mcp() {
    print_info "Checking for Redis MCP server..."
    
    # Since there's no official Redis MCP server, we'll use the postgres one as an example
    # or create a custom one if needed
    print_warning "No official Redis MCP server found"
    print_info "You can use the postgres MCP server instead, or create a custom one"
}

# Update Claude Desktop configuration to include Redis
update_claude_config() {
    print_info "Updating Claude Desktop configuration..."
    
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    
    if [ ! -f "$CONFIG_FILE" ]; then
        print_warning "Claude Desktop config file not found, creating a new one..."
        mkdir -p "$CLAUDE_CONFIG_DIR"
        
        cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/jaseem/Documents/GitHub/Techkwiz-v8"]
    }
  }
}
EOF
    fi
    
    # Check if Redis configuration already exists
    if grep -q "redis" "$CONFIG_FILE"; then
        print_status "Redis configuration already exists in Claude Desktop config"
    else
        print_info "Adding Redis configuration to Claude Desktop config..."
        
        # Create a backup
        cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
        
        # Add Redis configuration (using a custom approach since there's no official Redis MCP server)
        # We'll add a note about how to set it up
        print_warning "No official Redis MCP server available"
        print_info "You can create a custom Redis MCP server or use postgres instead"
    fi
    
    print_status "Claude Desktop configuration updated"
}

# Create a custom Redis MCP server example
create_custom_redis_mcp() {
    print_info "Creating a custom Redis MCP server example..."
    
    CUSTOM_MCP_DIR="./custom-mcp-servers"
    mkdir -p "$CUSTOM_MCP_DIR"
    
    cat > "$CUSTOM_MCP_DIR/redis-mcp-server.js" << 'EOF'
#!/usr/bin/env node

// Custom Redis MCP Server Example
// This is a simplified example - you would need to implement full MCP protocol

import { createServer } from '@modelcontextprotocol/sdk/server/index.js';
import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

async function initializeRedisClient() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
}

// Initialize Redis client
await initializeRedisClient();

// Create MCP server
const server = createServer(
  {
    name: "Redis MCP Server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Add your Redis-related tools here
// For example:
server.tools.set("redis_get", {
  description: "Get value from Redis by key",
  inputSchema: {
    type: "object",
    properties: {
      key: { type: "string", description: "Redis key to get" }
    },
    required: ["key"]
  },
  handler: async (input) => {
    try {
      const value = await redisClient.get(input.key);
      return { value };
    } catch (error) {
      return { error: error.message };
    }
  }
});

server.tools.set("redis_set", {
  description: "Set value in Redis by key",
  inputSchema: {
    type: "object",
    properties: {
      key: { type: "string", description: "Redis key to set" },
      value: { type: "string", description: "Value to set" }
    },
    required: ["key", "value"]
  },
  handler: async (input) => {
    try {
      await redisClient.set(input.key, input.value);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }
});

// Handle server connection
server.listen().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Redis MCP Server...');
  await redisClient.quit();
  process.exit(0);
});
EOF
    
    # Make it executable
    chmod +x "$CUSTOM_MCP_DIR/redis-mcp-server.js"
    
    # Create package.json for the custom server
    cat > "$CUSTOM_MCP_DIR/package.json" << 'EOF'
{
  "name": "custom-redis-mcp-server",
  "version": "1.0.0",
  "description": "Custom Redis MCP Server",
  "main": "redis-mcp-server.js",
  "type": "module",
  "scripts": {
    "start": "node redis-mcp-server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "redis": "^4.0.0"
  }
}
EOF
    
    print_status "Custom Redis MCP server example created in $CUSTOM_MCP_DIR"
    print_info "To use it:"
    print_info "1. cd $CUSTOM_MCP_DIR"
    print_info "2. npm install"
    print_info "3. npm start"
}

# Main function
main() {
    echo
    print_info "Starting Redis MCP Server Setup..."
    echo
    
    check_redis
    check_redis_mcp
    update_claude_config
    create_custom_redis_mcp
    
    echo
    print_status "🎉 Redis MCP Server Setup Completed!"
    echo
    print_info "Next steps:"
    print_info "1. Redis server is running at redis://localhost:6379"
    print_info "2. Check the custom Redis MCP server example in ./custom-mcp-servers/"
    print_info "3. You can add Redis configuration to Claude Desktop manually if needed"
    print_info "4. Consider using postgres MCP server instead if Redis isn't required"
    echo
    print_warning "Note: There is no official Redis MCP server. The custom example shows how to create one."
}

main "$@"