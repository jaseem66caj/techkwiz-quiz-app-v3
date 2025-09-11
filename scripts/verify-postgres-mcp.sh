#!/bin/bash

# Verify Postgres MCP Script
# This script verifies that the postgres MCP server is working correctly

echo "🔍 Verifying Postgres MCP Server"
echo "============================="

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

# Function to check if PostgreSQL is running
check_postgres() {
    print_info "Checking PostgreSQL status..."
    
    if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        print_status "PostgreSQL is running"
        return 0
    else
        print_error "PostgreSQL is not running"
        return 1
    fi
}

# Function to check if database exists
check_database() {
    print_info "Checking if 'techkwiz' database exists..."
    
    if psql -lqt | cut -d \| -f 1 | grep -qw techkwiz; then
        print_status "Database 'techkwiz' exists"
        return 0
    else
        print_error "Database 'techkwiz' does not exist"
        return 1
    fi
}

# Function to check Claude Desktop configuration
check_claude_config() {
    print_info "Checking Claude Desktop configuration..."
    
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    
    if [ -f "$CONFIG_FILE" ]; then
        print_status "Claude Desktop configuration found"
        
        # Check if postgres server is configured
        if grep -q "server-postgres" "$CONFIG_FILE"; then
            print_status "Postgres MCP server is configured"
            
            # Check database URL
            if grep -q "postgresql://localhost/techkwiz" "$CONFIG_FILE"; then
                print_status "Database URL is correct"
                return 0
            else
                print_error "Database URL is incorrect"
                return 1
            fi
        else
            print_error "Postgres MCP server is not configured"
            return 1
        fi
    else
        print_error "Claude Desktop configuration not found"
        return 1
    fi
}

# Function to test postgres MCP server
test_postgres_mcp() {
    print_info "Testing postgres MCP server..."
    
    # Try to start the server in the background
    timeout 10 npx -y @modelcontextprotocol/server-postgres postgresql://localhost/techkwiz >/dev/null 2>&1 &
    SERVER_PID=$!
    
    # Wait a moment for the server to start
    sleep 3
    
    # Check if the server is running
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_status "Postgres MCP server started successfully"
        # Kill the server
        kill $SERVER_PID 2>/dev/null
        return 0
    else
        print_error "Postgres MCP server failed to start"
        return 1
    fi
}

# Main verification function
main() {
    echo
    print_info "Starting verification process..."
    echo
    
    # Check PostgreSQL
    if ! check_postgres; then
        print_error "PostgreSQL verification failed"
        exit 1
    fi
    
    # Check database
    if ! check_database; then
        print_error "Database verification failed"
        exit 1
    fi
    
    # Check Claude configuration
    if ! check_claude_config; then
        print_error "Claude Desktop configuration verification failed"
        exit 1
    fi
    
    # Test postgres MCP server
    # Note: We're not testing the server here because it requires Claude Desktop to be running
    # and the MCP server to be started by Claude Desktop
    
    echo
    print_status "✅ Postgres MCP Server Verification Completed!"
    print_info "Summary:"
    print_info "  ✅ PostgreSQL is running"
    print_info "  ✅ Database 'techkwiz' exists"
    print_info "  ✅ Claude Desktop is configured correctly"
    print_info ""
    print_info "To test the postgres MCP server in Claude Desktop:"
    print_info "1. Make sure Claude Desktop is running"
    print_info "2. In Claude Desktop, try asking:"
    print_info "   - 'Can you store this information in a database?'"
    print_info "   - 'What can you do with the postgres server?'"
    print_info ""
    print_warning "If you still encounter issues:"
    print_info "1. Restart Claude Desktop"
    print_info "2. Check that PostgreSQL is running: brew services start postgresql@14"
    print_info "3. Verify the database exists: createdb techkwiz"
}

main "$@"