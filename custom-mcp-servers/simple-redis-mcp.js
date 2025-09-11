#!/usr/bin/env node

// Simple Redis MCP Server - Just for testing Redis connection
// This is a minimal implementation to verify Redis connectivity

import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
  process.exit(1);
});

// Handle connection events
redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
});

redisClient.on('end', () => {
  console.log('Redis Client Disconnected');
});

async function initializeRedisClient() {
  try {
    await redisClient.connect();
    console.log('Successfully connected to Redis at:', redisClient.options.url);
    
    // Test setting and getting a value
    await redisClient.set('test_key', 'test_value');
    const value = await redisClient.get('test_key');
    console.log('Test key-value pair:', 'test_key', '=', value);
    
    console.log('Redis MCP Server is running and connected!');
    console.log('Press Ctrl+C to stop');
    
    // Keep the process running
    setInterval(() => {
      // Keep alive
    }, 10000);
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
}

// Initialize Redis client
initializeRedisClient().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Redis MCP Server...');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down Redis MCP Server...');
  await redisClient.quit();
  process.exit(0);
});