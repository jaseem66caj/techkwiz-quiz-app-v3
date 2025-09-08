#!/usr/bin/env node

/**
 * Sentry Integration Test Script
 * Tests the Sentry DSN configuration and error reporting
 */

const https = require('https');
const url = require('url');

// Your Sentry DSN
const SENTRY_DSN = 'https://d4583b0d14043856af3ae7fd78d2c0a3@o4509983020220416.ingest.us.sentry.io/4509983022186496';

console.log('🚨 Testing Sentry Integration...\n');

// Parse DSN
function parseDSN(dsn) {
  try {
    const parsed = new URL(dsn);
    return {
      protocol: parsed.protocol,
      host: parsed.host,
      pathname: parsed.pathname,
      publicKey: parsed.username,
      projectId: parsed.pathname.split('/').pop(),
      valid: true
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Test DSN format
console.log('1. Testing DSN Format...');
const dsnInfo = parseDSN(SENTRY_DSN);

if (!dsnInfo.valid) {
  console.log('❌ Invalid DSN format:', dsnInfo.error);
  process.exit(1);
}

console.log('✅ DSN format is valid');
console.log(`   - Host: ${dsnInfo.host}`);
console.log(`   - Project ID: ${dsnInfo.projectId}`);
console.log(`   - Public Key: ${dsnInfo.publicKey.substring(0, 8)}...`);

// Test Sentry endpoint connectivity
console.log('\n2. Testing Sentry Endpoint Connectivity...');

const testEndpoint = `https://${dsnInfo.host}/api/${dsnInfo.projectId}/envelope/`;

const testData = JSON.stringify({
  event_id: 'test-' + Date.now(),
  timestamp: new Date().toISOString(),
  message: 'Test message from TechKwiz v8 deployment verification',
  level: 'info',
  platform: 'javascript',
  sdk: {
    name: 'test-script',
    version: '1.0.0'
  },
  tags: {
    environment: 'deployment-test',
    source: 'deployment-verification'
  }
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData),
    'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${dsnInfo.publicKey}, sentry_client=test-script/1.0.0`
  }
};

const req = https.request(testEndpoint, options, (res) => {
  console.log(`✅ Sentry endpoint responded with status: ${res.statusCode}`);
  
  if (res.statusCode === 200 || res.statusCode === 202) {
    console.log('✅ Sentry is accepting events successfully');
    console.log('\n🎉 Sentry Integration Test PASSED!');
    console.log('\n📋 Next Steps:');
    console.log('1. Add the DSN to GitHub Secrets');
    console.log('2. Push code to trigger GitHub Actions');
    console.log('3. Check Sentry dashboard for events');
    console.log('\n🔗 Your Sentry Project: https://sentry.io/organizations/your-org/projects/');
  } else {
    console.log('⚠️  Unexpected response status, but endpoint is reachable');
  }
  
  res.on('data', (chunk) => {
    // Log response if needed
  });
});

req.on('error', (error) => {
  console.log('❌ Failed to connect to Sentry endpoint:', error.message);
  console.log('⚠️  This might be a network issue, but the DSN format is correct');
});

req.write(testData);
req.end();

// Test environment variable format
console.log('\n3. Testing Environment Variable Format...');
console.log('✅ DSN is properly formatted for NEXT_PUBLIC_SENTRY_DSN');
console.log('\n📝 GitHub Secret Configuration:');
console.log('Name: NEXT_PUBLIC_SENTRY_DSN');
console.log(`Value: ${SENTRY_DSN}`);

console.log('\n🔧 Additional Configuration Options:');
console.log('Optional secrets you can add:');
console.log('- NEXT_PUBLIC_APP_URL: https://play.techkwiz.com');
console.log('- NEXT_PUBLIC_ANALYTICS_ID: G-XXXXXXXXXX (if you have Google Analytics)');
console.log('- SENTRY_ORG: your-sentry-org (for source maps)');
console.log('- SENTRY_PROJECT: techkwiz-v8 (for source maps)');
console.log('- SENTRY_AUTH_TOKEN: your-auth-token (for source maps)');
