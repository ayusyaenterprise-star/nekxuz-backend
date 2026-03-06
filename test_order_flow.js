const http = require('http');
const crypto = require('crypto');

// Test order data
const testOrder = {
  razorpay_order_id: 'order_test_' + Date.now(),
  razorpay_payment_id: 'pay_test_' + Date.now(),
  razorpay_signature: 'test_signature',
  invoicePayload: {
    order_items: [
      {
        name: 'Honey Almond 100ml',
        units: 2,
        selling_price: 499
      }
    ],
    billing_customer_name: 'John Doe',
    billing_email: 'john@example.com',
    billing_phone: '9876543210',
    billing_address: '123 Main Street',
    billing_city: 'New Delhi',
    billing_state: 'Delhi',
    billing_pincode: '110001',
    shipping_charges: 99
  }
};

// Load environment variables
require('dotenv').config();

// Create proper signature
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'RAvLrluRR2cb6kVVc5OxAHbI';
const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
hmac.update(testOrder.razorpay_order_id + '|' + testOrder.razorpay_payment_id);
testOrder.razorpay_signature = hmac.digest('hex');

console.log('🧪 Testing Order Flow...\n');
console.log('📦 Test Order Data:');
console.log(JSON.stringify(testOrder, null, 2));

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/payment/verify',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': JSON.stringify(testOrder).length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('\n✅ Response Status:', res.statusCode);
    console.log('📝 Response Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.ok) {
        console.log('\n✨ Order created successfully!');
        console.log('  - Shipment ID:', parsed.shipment?.shipment_id);
        console.log('  - AWB:', parsed.shipment?.awb);
        
        // Now test /api/orders endpoint
        console.log('\n🔍 Fetching orders for email...');
        testOrdersEndpoint('john@example.com');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request Error:', err.message);
});

req.write(JSON.stringify(testOrder));
req.end();

// Test /api/orders endpoint
function testOrdersEndpoint(email) {
  const orderOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/orders?email=' + email,
    method: 'GET'
  };

  const orderReq = http.request(orderOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('\n✅ Orders Endpoint Response:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.orders && parsed.orders.length > 0) {
          const order = parsed.orders[0];
          console.log('\n📊 Order Details Validation:');
          console.log('  ✓ ID:', order.id ? '✅' : '❌');
          console.log('  ✓ Subtotal:', order.subtotal ? '✅' : '❌', order.subtotal);
          console.log('  ✓ Tax:', order.tax ? '✅' : '❌', order.tax);
          console.log('  ✓ Shipping Charges:', order.shippingCharges ? '✅' : '❌', order.shippingCharges);
          console.log('  ✓ Buyer Name:', order.buyerName ? '✅' : '❌', order.buyerName);
          console.log('  ✓ Buyer Email:', order.buyerEmail ? '✅' : '❌', order.buyerEmail);
          console.log('  ✓ Buyer Phone:', order.buyerPhone ? '✅' : '❌', order.buyerPhone);
          console.log('  ✓ Buyer Address:', order.buyerAddress ? '✅' : '❌', order.buyerAddress);
          console.log('  ✓ Shipment Info:', order.shipment ? '✅' : '❌');
          if (order.shipment) {
            console.log('    - AWB:', order.shipment.awb);
            console.log('    - Courier:', order.shipment.courier);
            console.log('    - Status:', order.shipment.status);
          }
        }
      } catch (e) {
        console.log(data);
      }
    });
  });

  orderReq.on('error', (err) => {
    console.error('❌ Orders Request Error:', err.message);
  });

  orderReq.end();
}
