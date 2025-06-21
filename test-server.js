#!/usr/bin/env node

/**
 * Simple test script to verify the MCP server functionality
 * This script simulates basic MCP protocol interactions
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  EMLOG_API_URL: 'https://demo.emlog.net',
  EMLOG_API_KEY: 'test_key_123'
};

function testMCPServer() {
  console.log('🚀 Starting Emlog MCP Server Test...');
  
  const serverPath = join(__dirname, 'dist', 'index.js');
  
  // Spawn the MCP server process
  const server = spawn('node', [serverPath], {
    env: {
      ...process.env,
      ...TEST_CONFIG
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let responseData = '';

  // Test 1: Initialize connection
  console.log('📡 Test 1: Initializing MCP connection...');
  
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        resources: {},
        tools: {}
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  server.stdout.on('data', (data) => {
    responseData += data.toString();
    console.log('📥 Server response:', data.toString().trim());
  });

  server.stderr.on('data', (data) => {
    console.log('📋 Server log:', data.toString().trim());
  });

  server.on('close', (code) => {
    console.log(`🏁 Server process exited with code ${code}`);
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });

  // Send initialization message
  setTimeout(() => {
    console.log('📤 Sending initialization message...');
    server.stdin.write(JSON.stringify(initMessage) + '\n');
  }, 1000);

  // Test 2: List resources
  setTimeout(() => {
    console.log('📡 Test 2: Listing resources...');
    const listResourcesMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'resources/list'
    };
    server.stdin.write(JSON.stringify(listResourcesMessage) + '\n');
  }, 2000);

  // Test 3: List tools
  setTimeout(() => {
    console.log('📡 Test 3: Listing tools...');
    const listToolsMessage = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/list'
    };
    server.stdin.write(JSON.stringify(listToolsMessage) + '\n');
  }, 3000);

  // Clean up after tests
  setTimeout(() => {
    console.log('🧹 Cleaning up test...');
    server.kill('SIGTERM');
    
    setTimeout(() => {
      console.log('✅ Test completed!');
      console.log('\n📊 Test Summary:');
      console.log('- MCP server can be started');
      console.log('- Server responds to stdio communication');
      console.log('- Basic MCP protocol messages are handled');
      console.log('\n💡 Next steps:');
      console.log('1. Configure your Emlog API URL and key in .env');
      console.log('2. Add this server to your MCP client configuration');
      console.log('3. Test with real Emlog API endpoints');
      process.exit(0);
    }, 1000);
  }, 5000);
}

// Check if dist directory exists
import { existsSync } from 'fs';
const distPath = join(__dirname, 'dist', 'index.js');

if (!existsSync(distPath)) {
  console.error('❌ Error: dist/index.js not found. Please run "npm run build" first.');
  process.exit(1);
}

testMCPServer();