/**
 * Script to add orders directly to Firestore using REST API
 * No credentials file needed!
 */

const Razorpay = require('razorpay');
const https = require('https');

// Razorpay credentials
const razorpay = new Razorpay({
  key_id: 'rzp_live_SMqkVvPnni1H3X',
  key_secret: 'Yv4Bd637j5fjHGJ7hrPe1vDV'
});

// Firebase REST API endpoint
const FIREBASE_PROJECT = 'nekxuz-27e49';
const FIREBASE_DB_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/orders`;

// Your Firebase Web API Key (from Firebase Console)
const FIREBASE_API_KEY = 'AIzaSyCp_B50oMUb_lMBxpAOxh5qcSPeng9PbyM';

function addOrderToFirestore(orderData) {
  return new Promise((resolve, reject) => {
    const docId = orderData.paymentId;
    const url = `${FIREBASE_DB_URL}?documentId=${docId}&key=${FIREBASE_API_KEY}`;
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    
    // Convert to Firestore REST format
    const firestoreDoc = {
      fields: {
        id: { stringValue: orderData.paymentId },
        email: { stringValue: orderData.email },
        buyerEmail: { stringValue: orderData.email },
        buyerName: { stringValue: orderData.buyerName },
        amount: { doubleValue: orderData.amount },
        status: { stringValue: 'paid' },
        paymentId: { stringValue: orderData.paymentId },
        invoiceId: { stringValue: `invoice_${orderData.paymentId}` },
        createdAt: { timestampValue: new Date(orderData.createdAt).toISOString() },
        items: { arrayValue: { values: [] } },
        shipment: {
          mapValue: {
            fields: {
              status: { stringValue: 'Processing' },
              awb: { nullValue: null }
            }
          }
        }
      }
    };

    req.write(JSON.stringify(firestoreDoc));
    req.end();
  });
}

async function populateOrders() {
  try {
    console.log('📥 Fetching orders from Razorpay...');
    
    const payments = await razorpay.payments.all({ count: 100 });
    console.log(`Found ${payments.items.length} payments in Razorpay\n`);
    
    let addedCount = 0;
    
    for (const payment of payments.items) {
      if (payment.status !== 'captured') {
        console.log(`⏭️  Skipping ${payment.id} (status: ${payment.status})`);
        continue;
      }
      
      const orderData = {
        paymentId: payment.id,
        email: payment.notes?.email || 'unknown@example.com',
        buyerName: payment.notes?.name || 'Customer',
        amount: payment.amount / 100,
        createdAt: new Date(payment.created_at * 1000),
        items: payment.notes?.items || []
      };
      
      try {
        await addOrderToFirestore(orderData);
        console.log(`✅ Added: ${payment.id} | ₹${orderData.amount} | ${orderData.email}`);
        addedCount++;
      } catch (error) {
        console.error(`❌ Error: ${payment.id} - ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Successfully added ${addedCount} orders to Firestore!`);
    console.log('📱 Refresh your website to see the orders in your account!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

populateOrders();
