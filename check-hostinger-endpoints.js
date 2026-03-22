const https = require('https');

// Check what endpoints are available
const testEndpoints = [
  'https://api.nekxuz.in/health',
  'https://api.nekxuz.in/api/health',
  'https://api.nekxuz.in/'
];

console.log('🔍 Checking Hostinger backend endpoints...\n');

testEndpoints.forEach(url => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`✓ ${url}`);
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Response: ${data.substring(0, 100)}\n`);
    });
  }).on('error', (err) => {
    console.log(`✗ ${url}`);
    console.log(`  Error: ${err.message}\n`);
  });
});
