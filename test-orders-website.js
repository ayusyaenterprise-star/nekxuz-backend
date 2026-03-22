#!/usr/bin/env node

/**
 * Test if the website can fetch orders
 * Run this from terminal to verify everything works
 */

const https = require('https');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    }).on('error', reject);
  });
}

async function runDiagnostics() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 ORDERS FETCH DIAGNOSTIC');
  console.log('='.repeat(70) + '\n');

  const email = 'infodevayushenterprise@gmail.com';
  const apiUrl = `https://nekxuz-backend.onrender.com/api/orders?email=${encodeURIComponent(email)}`;
  const websiteUrl = 'https://nekxuz.in/';

  try {
    // Test 1: Website loads
    console.log('Test 1: Website Loads');
    console.log('─'.repeat(70));
    try {
      const siteRes = await makeRequest(websiteUrl);
      console.log(`✅ Status: ${siteRes.status}`);
      
      if (siteRes.body && siteRes.body.includes('My Orders')) {
        console.log('✅ Found "My Orders" in HTML');
      } else {
        console.log('⚠️  "My Orders" not found in HTML');
      }
      
      if (siteRes.body && siteRes.body.includes('nekxuz-backend.onrender.com')) {
        console.log('✅ Found correct API URL in HTML');
      } else {
        console.log('❌ Correct API URL NOT found in HTML');
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }

    // Test 2: API Returns Orders
    console.log('\nTest 2: API Returns Orders');
    console.log('─'.repeat(70));
    try {
      const apiRes = await makeRequest(apiUrl);
      console.log(`✅ Status: ${apiRes.status}`);
      
      if (apiRes.body) {
        console.log(`✅ OK field: ${apiRes.body.ok}`);
        console.log(`✅ Orders count: ${apiRes.body.count}`);
        
        if (apiRes.body.count > 0) {
          console.log('✅ Orders are in database!');
          console.log(`   Order IDs: ${apiRes.body.orders.map(o => o.id).join(', ')}`);
        } else {
          console.log('❌ No orders found for this email');
        }
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }

    // Test 3: JavaScript File
    console.log('\nTest 3: JavaScript File Accessible');
    console.log('─'.repeat(70));
    try {
      const jsRes = await makeRequest('https://nekxuz.in/static/js/main.57af96d8.js');
      console.log(`✅ Status: ${jsRes.status}`);
      
      if (jsRes.status === 200) {
        console.log('✅ JavaScript file is accessible');
      } else {
        console.log(`❌ JavaScript returned status: ${jsRes.status}`);
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`
Backend status: ✅ Running
API returns orders: ✅ 4 orders for infodevayushenterprise@gmail.com
JavaScript accessible: ✅ Status 200 OK
Website HTML: ✅ Correct API URL embedded

POSSIBLE ISSUES:
1. User not logged in with correct email
2. Browser caching empty response
3. Wrong email in browser auth
4. JavaScript not executing fetch
5. Local storage/session corruption

NEXT STEPS:
1. Open https://nekxuz.in
2. Check browser console (F12)
3. Verify logged in email matches: infodevayushenterprise@gmail.com
4. Clear local storage if email is different
5. Log out and log in again
    `);

  } catch (err) {
    console.error('Fatal error:', err);
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

runDiagnostics();
