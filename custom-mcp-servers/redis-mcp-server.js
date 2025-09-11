#!/usr/bin/env node

// Custom Redis MCP Server Example
// This is a simplified example - you would need to implement full MCP protocol

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
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
const server = new Server(
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
server.listen();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Redis MCP Server...');
  await redisClient.quit();
  process.exit(0);
});
