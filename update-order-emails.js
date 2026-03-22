/**
 * Script to update orders with correct email address
 */

const https = require('https');

const FIREBASE_PROJECT = 'nekxuz-27e49';
const FIREBASE_API_KEY = 'AIzaSyCp_B50oMUb_lMBxpAOxh5qcSPeng9PbyM';

// Payment IDs that were just added
const paymentIds = [
  'pay_SSfFmOTdkU7JVT',
  'pay_SRbdC8iOiteX73',
  'pay_SP1bMSHFbIbhV0',
  'pay_SN0urhii26JnJQ'
];

const correctEmail = 'infodevayushenterprise@gmail.com';

function updateOrderEmail(paymentId, email) {
  return new Promise((resolve, reject) => {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/orders/${paymentId}?key=${FIREBASE_API_KEY}`;
    
    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    
    const updateDoc = {
      fields: {
        email: { stringValue: email },
        buyerEmail: { stringValue: email }
      }
    };

    req.write(JSON.stringify(updateDoc));
    req.end();
  });
}

async function updateAllOrders() {
  try {
    console.log(`📧 Updating orders with correct email: ${correctEmail}\n`);
    
    let updatedCount = 0;
    
    for (const paymentId of paymentIds) {
      try {
        await updateOrderEmail(paymentId, correctEmail);
        console.log(`✅ Updated: ${paymentId} → ${correctEmail}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating ${paymentId}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} orders!`);
    console.log('📱 Refresh your website and login with: infodevayushenterprise@gmail.com');
    console.log('🎯 Your orders should now appear in your Account tab!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateAllOrders();
