#!/usr/bin/env node

/**
 * Diagnostic script to check why orders aren't displaying
 * Tests: API connectivity, CORS, response format, etc.
 */

const axios = require('axios');

const API_URL = 'https://nekxuz-backend.onrender.com';
const TEST_EMAIL = 'infodevayushenterprise@gmail.com';
const WEBSITE_URL = 'https://nekxuz.in';

console.log('\n' + '='.repeat(60));
console.log('🔍 ORDERS DISPLAY DIAGNOSTIC');
console.log('='.repeat(60) + '\n');

async function runDiagnostics() {
  try {
    // Test 1: Backend health
    console.log('✓ Test 1: Backend Health');
    console.log('─'.repeat(60));
    try {
      const healthRes = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      console.log(`  Status: ✅ ${healthRes.status}`);
      console.log(`  Response: ${JSON.stringify(healthRes.data)}`);
    } catch (err) {
      console.log(`  Status: ❌ ${err.message}`);
      return;
    }

    // Test 2: API Orders Endpoint
    console.log('\n✓ Test 2: Orders API Endpoint');
    console.log('─'.repeat(60));
    try {
      const ordersRes = await axios.get(`${API_URL}/api/orders?email=${encodeURIComponent(TEST_EMAIL)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': WEBSITE_URL
        },
        timeout: 5000
      });
      
      console.log(`  Status: ✅ ${ordersRes.status}`);
      console.log(`  Response format: ${typeof ordersRes.data}`);
      console.log(`  Has 'ok' field: ${ordersRes.data.ok ? '✅' : '❌'}`);
      console.log(`  Has 'orders' array: ${Array.isArray(ordersRes.data.orders) ? '✅' : '❌'}`);
      console.log(`  Order count: ${ordersRes.data.count}`);
      
      if (ordersRes.data.orders && ordersRes.data.orders.length > 0) {
        console.log(`  First order ID: ${ordersRes.data.orders[0].id}`);
        console.log(`  First order amount: ${ordersRes.data.orders[0].amount}`);
      }
      
      console.log(`\n  📊 Raw Response (first 200 chars):`);
      const responseStr = JSON.stringify(ordersRes.data).substring(0, 200);
      console.log(`     ${responseStr}...`);
    } catch (err) {
      console.log(`  Status: ❌ ${err.message}`);
      if (err.response) {
        console.log(`  Response status: ${err.response.status}`);
        console.log(`  Response data: ${JSON.stringify(err.response.data)}`);
      }
      return;
    }

    // Test 3: CORS Headers
    console.log('\n✓ Test 3: CORS Headers');
    console.log('─'.repeat(60));
    try {
      const corsRes = await axios.options(`${API_URL}/api/orders`, {
        headers: {
          'Origin': WEBSITE_URL
        },
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status
      });
      
      const corsHeaders = {
        'access-control-allow-origin': corsRes.headers['access-control-allow-origin'],
        'access-control-allow-methods': corsRes.headers['access-control-allow-methods'],
        'access-control-allow-headers': corsRes.headers['access-control-allow-headers'],
        'access-control-allow-credentials': corsRes.headers['access-control-allow-credentials']
      };
      
      console.log(`  Access-Control-Allow-Origin: ${corsHeaders['access-control-allow-origin'] || '❌ NOT SET'}`);
      console.log(`  Access-Control-Allow-Methods: ${corsHeaders['access-control-allow-methods'] || '❌ NOT SET'}`);
      console.log(`  Access-Control-Allow-Credentials: ${corsHeaders['access-control-allow-credentials'] || '❌ NOT SET'}`);
    } catch (err) {
      console.log(`  ⚠️  Could not check CORS: ${err.message}`);
    }

    // Test 4: Website Current Build
    console.log('\n✓ Test 4: Website Current Build');
    console.log('─'.repeat(60));
    try {
      const webRes = await axios.get(WEBSITE_URL, { timeout: 10000 });
      const html = webRes.data;
      
      // Check for API URL in HTML
      if (html.includes('nekxuz-backend.onrender.com')) {
        console.log(`  ✅ Website has correct API URL in build`);
      } else {
        console.log(`  ❌ Website does NOT have correct API URL`);
      }
      
      // Check for React build
      if (html.includes('main.') && html.includes('static')) {
        console.log(`  ✅ Website has React bundle (main.*.js)`);
      } else {
        console.log(`  ⚠️  Website may not have React bundle`);
      }
      
      // Look for API URL patterns
      const apiMatch = html.match(/API_BASE_URL["\s:]*["']([^"']+)["']/);
      if (apiMatch) {
        console.log(`  API URL in build: ${apiMatch[1]}`);
      }
    } catch (err) {
      console.log(`  ❌ Could not fetch website: ${err.message}`);
    }

    // Test 5: Check if orders match test email
    console.log('\n✓ Test 5: Order Email Verification');
    console.log('─'.repeat(60));
    try {
      const ordersRes = await axios.get(`${API_URL}/api/orders?email=${encodeURIComponent(TEST_EMAIL)}`, { timeout: 5000 });
      
      if (ordersRes.data.count === 0) {
        console.log(`  ⚠️  No orders found for email: ${TEST_EMAIL}`);
        console.log(`  Test with different email?`);
      } else {
        console.log(`  ✅ Found ${ordersRes.data.count} orders for ${TEST_EMAIL}`);
        ordersRes.data.orders.forEach((order, idx) => {
          console.log(`     ${idx + 1}. Order ${order.id.substring(0, 8)} - ₹${order.amount}`);
        });
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }

  } catch (err) {
    console.error('Fatal error:', err);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 DIAGNOSTIC COMPLETE');
  console.log('='.repeat(60) + '\n');
}

runDiagnostics();
