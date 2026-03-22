const https = require('https');

// Test the actual API endpoint
const url = 'https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com';

console.log(`📡 Testing: ${url}\n`);

https.get(url, (res) => {
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Response Status:', res.statusCode);
      console.log('Response Headers:', {
        'content-type': res.headers['content-type'],
        'server': res.headers['server']
      });
      console.log('Response Body:', JSON.stringify(json, null, 2));
      console.log(`\n❌ Orders returned: ${json.orders ? json.orders.length : 0}`);
    } catch (e) {
      console.log('Raw Response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
