# MCP Servers for TechKwiz Project

This guide explains the Model Context Protocol (MCP) servers configured for your TechKwiz project and how they enhance your development workflow.

## What is MCP?

Model Context Protocol (MCP) is an open standard that allows AI assistants like Claude to connect to external tools, databases, and services. Think of it as giving Claude superpowers to interact with your development environment.

## Installed MCP Servers

### 🗂️ **Core Development Servers**

#### 1. **Filesystem Server** (`@modelcontextprotocol/server-filesystem`)
- **Purpose**: Direct access to your TechKwiz project files
- **Benefits**: 
  - Read, write, and manage project files
  - Navigate directory structure
  - Analyze code structure and dependencies
- **Use Cases**: Code review, file organization, debugging

#### 2. **Git Server** (`@modelcontextprotocol/server-git`)
- **Purpose**: Git repository operations
- **Benefits**:
  - View commit history and diffs
  - Manage branches and merges
  - Analyze code changes
- **Use Cases**: Version control, code history analysis, branch management

#### 3. **GitHub Server** (`@modelcontextprotocol/server-github`)
- **Purpose**: GitHub API integration
- **Benefits**:
  - Manage issues and pull requests
  - View repository statistics
  - Automate GitHub workflows
- **Use Cases**: Issue tracking, PR management, repository analytics
- **Setup**: Requires GitHub Personal Access Token

### 🌐 **Web & Research Servers**

#### 4. **Brave Search Server** (`@modelcontextprotocol/server-brave-search`)
- **Purpose**: Web search capabilities
- **Benefits**:
  - Research development topics
  - Find documentation and tutorials
  - Stay updated with latest tech trends
- **Use Cases**: Technical research, documentation lookup, troubleshooting
- **Setup**: Requires Brave Search API key (free tier available)

#### 5. **Fetch Server** (`@modelcontextprotocol/server-fetch`)
- **Purpose**: Web content fetching and processing
- **Benefits**:
  - Download and analyze web content
  - Extract information from websites
  - Monitor external APIs
- **Use Cases**: API testing, content analysis, web scraping

#### 6. **Puppeteer Server** (`@modelcontextprotocol/server-puppeteer`)
- **Purpose**: Browser automation
- **Benefits**:
  - Automated testing of your TechKwiz app
  - Screenshot generation
  - Performance testing
- **Use Cases**: E2E testing, UI testing, performance monitoring

### 🧠 **AI Enhancement Servers**

#### 7. **Memory Server** (`@modelcontextprotocol/server-memory`)
- **Purpose**: Persistent memory for AI conversations
- **Benefits**:
  - Remember project context across sessions
  - Store development decisions and patterns
  - Maintain conversation history
- **Use Cases**: Long-term project assistance, context retention

### 🛠️ **Utility Servers**

#### 8. **Time Server** (`@modelcontextprotocol/server-time`)
- **Purpose**: Time and date utilities
- **Benefits**:
  - Timezone conversions
  - Date calculations
  - Timestamp generation
- **Use Cases**: Logging, scheduling, time-based features

#### 9. **Calculator Server** (`githejie/mcp-server-calculator`)
- **Purpose**: Precise numerical calculations
- **Benefits**:
  - Performance metric calculations
  - Mathematical operations for algorithms
  - Data analysis
- **Use Cases**: Performance analysis, statistical calculations

#### 10. **JSON Filter Server** (`kehvinbehvin/json-mcp-filter`)
- **Purpose**: JSON data extraction and filtering
- **Benefits**:
  - Extract specific data from large JSON files
  - Filter configuration files
  - Analyze API responses
- **Use Cases**: Configuration management, API testing, data analysis

#### 11. **Screenshot Server** (`ananddtyagi/webpage-screenshot-mcp`)
- **Purpose**: Webpage screenshot capture
- **Benefits**:
  - Visual testing and validation
  - UI development feedback
  - Documentation generation
- **Use Cases**: UI testing, visual regression testing, documentation

## Installation Instructions

### 1. **Quick Setup**
```bash
chmod +x install-mcp-servers.sh
./install-mcp-servers.sh
```

### 2. **Manual Installation**
```bash
# Install core servers
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-brave-search
npm install -g @modelcontextprotocol/server-fetch
npm install -g @modelcontextprotocol/server-puppeteer
npm install -g @modelcontextprotocol/server-memory
npm install -g @modelcontextprotocol/server-time

# Install utility servers
npm install -g githejie/mcp-server-calculator
npm install -g kehvinbehvin/json-mcp-filter
npm install -g ananddtyagi/webpage-screenshot-mcp
```

### 3. **Configure Claude Desktop**
1. Copy `claude_desktop_config.json` to:
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```
2. Update API keys in the configuration file
3. Restart Claude Desktop

## API Keys Required

### **GitHub Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with repo permissions
3. Add to environment: `GITHUB_PERSONAL_ACCESS_TOKEN`

### **Brave Search API Key** (Optional but Recommended)
1. Visit [Brave Search API](https://api.search.brave.com/)
2. Sign up for free tier (2000 queries/month)
3. Add to environment: `BRAVE_API_KEY`

## Usage Examples

### **File Management**
```
"Can you analyze the structure of my TechKwiz project and suggest improvements?"
"Show me all TypeScript files that import React hooks"
"Create a new component file for the quiz timer"
```

### **Git Operations**
```
"What changes were made in the last 5 commits?"
"Create a new branch for the performance improvements"
"Show me the diff for the layout.tsx file"
```

### **Testing & Quality**
```
"Take a screenshot of the homepage and analyze the UI"
"Run performance tests and calculate the improvement metrics"
"Check the package.json for security vulnerabilities"
```

### **Research & Documentation**
```
"Search for best practices for Next.js 15 hydration issues"
"Fetch the latest React documentation for useEffect"
"Find examples of MCP server implementations"
```

## Benefits for TechKwiz Project

1. **🚀 Enhanced Development Speed**: Direct file access and Git operations
2. **🔍 Better Code Quality**: Automated testing and analysis tools
3. **📊 Performance Monitoring**: Built-in performance validation tools
4. **🧠 Intelligent Assistance**: Context-aware help with persistent memory
5. **🔗 Seamless Integration**: All tools work together in one interface
6. **📚 Research Capabilities**: Web search and content fetching for learning

## Security Notes

- Keep API keys secure and never commit them to version control
- Use environment variables for sensitive configuration
- Regularly rotate API keys
- Review MCP server permissions before installation

## Troubleshooting

### **Common Issues**
1. **Server not found**: Ensure npm packages are installed globally
2. **Permission denied**: Check file permissions and API keys
3. **Claude not connecting**: Restart Claude Desktop after config changes

### **Testing Installation**
```bash
./test-mcp-servers.sh
```

## Additional Resources

- [Official MCP Documentation](https://modelcontextprotocol.io/)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/mcp)

---

**Happy coding with your enhanced AI development environment! 🎉**
