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
