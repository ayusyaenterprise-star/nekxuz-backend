const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const axios = require('axios');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Express
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Initialize Razorpay with production keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_SMqkVvPnni1H3X',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'Yv4Bd637j5fjHGJ7hrPe1vDV'
});

// Shiprocket API config
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL || 'ayush.25327@ee.du.ac.in';
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD || 'lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!';

let shiprocketToken = null;

// --- ROOT ENDPOINT ---
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Nekxuz Backend Running on Firebase',
    platform: 'Firebase Firestore + Cloud Functions',
    razorpay_mode: 'PRODUCTION',
    database: 'Firestore',
    timestamp: new Date().toISOString()
  });
});

// --- CREATE RAZORPAY ORDER ---
app.post('/api/payment/create-order', async (req, res) => {
  try {
    console.log('Creating Razorpay order:', req.body);
    
    const { amount, currency = 'INR', invoiceNumber } = req.body;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: invoiceNumber || `order_${Date.now()}`
    });

    console.log('Order created:', order.id);
    res.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      localOrderId: `LOC-${Date.now()}`
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ 
      error: error.message,
      ok: false 
    });
  }
});

// --- VERIFY RAZORPAY PAYMENT ---
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    // Verify signature
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'Yv4Bd637j5fjHGJ7hrPe1vDV');
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed', ok: false });
    }

    // Save order to Firestore
    const orderRef = db.collection('orders').doc();
    await orderRef.set({
      id: orderRef.id,
      invoice: `invoice_${razorpay_payment_id}`,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      status: 'paid',
      ...orderData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Order saved:', orderRef.id);

    // Trigger Shiprocket shipment creation
    createShiprocketShipment(orderRef.id, orderData).catch(err => {
      console.error('Shiprocket error:', err.message);
    });

    res.json({
      ok: true,
      orderId: orderRef.id,
      message: 'Payment verified and order created'
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ 
      error: error.message,
      ok: false 
    });
  }
});

// --- GET USER ORDERS ---
app.get('/api/orders', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'email parameter required' });
    }

    const snapshot = await db.collection('orders')
      .where('buyerEmail', '==', email)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));

    console.log(`✅ Orders fetched for ${email}: ${orders.length}`);

    res.json({
      ok: true,
      orders: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ 
      error: error.message,
      ok: false 
    });
  }
});

// --- SHIPROCKET INTEGRATION ---
async function getShiprocketToken() {
  if (shiprocketToken) return shiprocketToken;

  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD
    });

    shiprocketToken = response.data.token;
    console.log('✅ Shiprocket token obtained');
    return shiprocketToken;
  } catch (error) {
    console.error('❌ Shiprocket login error:', error.message);
    throw error;
  }
}

async function createShiprocketShipment(orderId, orderData) {
  try {
    const token = await getShiprocketToken();

    const shipmentPayload = {
      order_id: orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location_id: process.env.SHIPROCKET_PICKUP_LOCATION_ID || 1,
      channel_id: 1, // Shopify channel
      comment: `Order ${orderId}`,
      billing_customer_name: orderData.buyerName,
      billing_email: orderData.buyerEmail,
      billing_phone: orderData.buyerPhone,
      billing_address: orderData.buyerAddress,
      billing_city: orderData.buyerCity,
      billing_state: orderData.buyerState,
      billing_country: 'India',
      billing_pincode: orderData.buyerPincode,
      shipping_is_billing: true,
      items: orderData.items || [],
      weight: 1,
      length: 10,
      breadth: 10,
      height: 10
    };

    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      shipmentPayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Shiprocket shipment created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Shiprocket shipment error:', error.message);
    throw error;
  }
}

// --- EXPORT AS CLOUD FUNCTION ---
exports.api = functions.https.onRequest(app);
