#!/usr/bin/env node

/**
 * 🔍 Comprehensive API Debugging
 * Tests different email formats and parameter passing
 */

const https = require('https');

const testCases = [
  {
    name: "With email parameter (URL encoded)",
    url: "https://api.nekxuz.in/api/orders?email=infodevayushenterprise%40gmail.com"
  },
  {
    name: "With email parameter (raw)",
    url: "https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com"
  },
  {
    name: "Without email parameter",
    url: "https://api.nekxuz.in/api/orders"
  },
  {
    name: "With different email",
    url: "https://api.nekxuz.in/api/orders?email=test@example.com"
  },
  {
    name: "Base endpoint check",
    url: "https://api.nekxuz.in/"
  }
];

async function runTests() {
  console.log('🔍 API Endpoint Testing\n');
  console.log('='.repeat(70));

  for (const test of testCases) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    
    try {
      const response = await fetch(test.url);
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      
      if (data.orders !== undefined) {
        console.log(`   Orders in response: ${data.orders.length}`);
        if (data.orders.length > 0) {
          console.log(`   ✓ Orders found!`);
          data.orders.slice(0, 2).forEach(o => {
            console.log(`     - ${o.id} | ₹${o.amount} | ${o.status}`);
          });
        } else {
          console.log(`   ❌ Empty orders array`);
        }
      } else if (data.message) {
        console.log(`   Message: ${data.message}`);
      } else if (data.error) {
        console.log(`   Error: ${data.error}`);
      } else {
        console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Summary:');
  console.log('   If all tests return empty orders, then Hostinger backend issue');
  console.log('   If error "email parameter required", then email not being passed');
  console.log('   If status 500, then database connection issue on Hostinger');
}

runTests();
