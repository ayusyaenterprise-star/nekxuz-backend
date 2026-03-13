/**
 * Nekxuz Backend - Firebase Cloud Functions
 * Replaces Render with FREE Firebase solution
 * 
 * Deploy with: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Express
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Initialize Razorpay with PRODUCTION keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_SMqkVvPnni1H3X',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'Yv4Bd637j5fjHGJ7hrPe1vDV'
});

// ============ COLLECTIONS ============
const ORDERS_COLLECTION = 'orders';
const PAYMENTS_COLLECTION = 'payments';
const SHIPMENTS_COLLECTION = 'shipments';

// ============ API ENDPOINTS ============

/**
 * Health Check
 */
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Nekxuz Backend Running on Firebase',
    timestamp: new Date().toISOString(),
    razorpay_mode: 'PRODUCTION',
    database: 'Firebase Firestore',
    version: '3.0.0-firebase'
  });
});

/**
 * Get Orders by Email
 */
app.get('/api/orders', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'email parameter required' });
    }

    const snapshot = await db
      .collection(ORDERS_COLLECTION)
      .where('buyerEmail', '==', email)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Orders fetched for ${email}: ${orders.length}`);

    res.json({
      ok: true,
      orders: orders.map(o => ({
        id: o.id,
        invoice: o.invoice,
        amount: o.amount,
        status: o.status,
        buyerName: o.buyerName,
        buyerEmail: o.buyerEmail,
        buyerPhone: o.buyerPhone,
        buyerAddress: o.buyerAddress,
        buyerCity: o.buyerCity,
        buyerState: o.buyerState,
        buyerPincode: o.buyerPincode,
        createdAt: o.createdAt,
        shipment: o.shipment || null
      }))
    });
  } catch (error) {
    console.error('❌ Orders fetch error:', error.message);
    res.status(500).json({ 
      error: error.message,
      ok: false 
    });
  }
});

/**
 * Create Payment Order (Razorpay)
 */
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', invoiceNumber, cartData, buyerEmail, buyerName } = req.body;

    if (!amount || !invoiceNumber) {
      return res.status(400).json({ 
        error: 'amount and invoiceNumber required' 
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Paise
      currency: currency,
      receipt: invoiceNumber,
      notes: {
        invoiceNumber,
        buyerEmail,
        buyerName,
        cartItems: cartData?.length || 0
      }
    });

    // Save order to Firestore
    const orderData = {
      invoice: invoiceNumber,
      amount: amount,
      currency: currency,
      status: 'created',
      buyerEmail: buyerEmail,
      buyerName: buyerName,
      cartData: cartData || [],
      razorpayOrderId: razorpayOrder.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection(ORDERS_COLLECTION).add(orderData);

    console.log(`✅ Order created: ${docRef.id}`);

    res.json({
      ok: true,
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      currency: currency,
      invoice: invoiceNumber,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_SMqkVvPnni1H3X'
    });
  } catch (error) {
    console.error('❌ Payment order creation error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

/**
 * Verify Payment & Update Order
 */
app.post('/api/payment/verify', async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      invoiceNumber,
      buyerEmail,
      buyerPhone,
      buyerAddress,
      buyerCity,
      buyerState,
      buyerPincode
    } = req.body;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'Yv4Bd637j5fjHGJ7hrPe1vDV')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.error('❌ Signature verification failed');
      return res.status(400).json({ 
        error: 'Payment verification failed' 
      });
    }

    console.log('✅ Payment signature verified');

    // Find and update order
    const orderSnapshot = await db
      .collection(ORDERS_COLLECTION)
      .where('invoice', '==', invoiceNumber)
      .limit(1)
      .get();

    if (orderSnapshot.empty) {
      return res.status(404).json({ 
        error: 'Order not found' 
      });
    }

    const orderDoc = orderSnapshot.docs[0];
    const orderId = orderDoc.id;

    // Update order with payment details
    await db.collection(ORDERS_COLLECTION).doc(orderId).update({
      status: 'paid',
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
      buyerPhone: buyerPhone,
      buyerAddress: buyerAddress,
      buyerCity: buyerCity,
      buyerState: buyerState,
      buyerPincode: buyerPincode,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Save payment record
    await db.collection(PAYMENTS_COLLECTION).add({
      orderId: orderId,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
      status: 'success',
      amount: orderDoc.data().amount,
      currency: orderDoc.data().currency,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Payment verified for order: ${orderId}`);

    res.json({
      ok: true,
      message: 'Payment verified successfully',
      orderId: orderId
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

/**
 * Razorpay Webhook Handler
 */
app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body.toString();

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'Yv4Bd637j5fjHGJ7hrPe1vDV')
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('❌ Webhook signature invalid');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(body);
    console.log('✅ Webhook received:', event.event);

    // Handle different webhook events
    if (event.event === 'payment.authorized' || event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      console.log('💳 Payment captured:', payment.id);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Shipment Status
 */
app.get('/api/shipment/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const shipmentSnapshot = await db
      .collection(SHIPMENTS_COLLECTION)
      .where('orderId', '==', orderId)
      .limit(1)
      .get();

    if (shipmentSnapshot.empty) {
      return res.json({ 
        ok: true,
        shipment: null 
      });
    }

    const shipment = {
      id: shipmentSnapshot.docs[0].id,
      ...shipmentSnapshot.docs[0].data()
    };

    res.json({ 
      ok: true,
      shipment: shipment 
    });
  } catch (error) {
    console.error('❌ Shipment fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Stock API - Get stock from Firestore
 */
app.get('/api/stock', async (req, res) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    const products = {};

    productsSnapshot.forEach(doc => {
      products[doc.id] = doc.data();
    });

    res.json({
      ok: true,
      products: products
    });
  } catch (error) {
    console.error('❌ Stock fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ EXPORT FUNCTIONS ============

/**
 * Firebase Cloud Function - Express API
 * Deploy with: firebase deploy --only functions
 */
exports.api = functions.https.onRequest(app);

/**
 * Scheduled function - Process failed shipments (runs daily)
 */
exports.processShipments = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      console.log('🚀 Processing shipments...');
      
      // Find orders with status 'paid' but no shipment
      const ordersSnapshot = await db
        .collection(ORDERS_COLLECTION)
        .where('status', '==', 'paid')
        .where('shipment', '==', null)
        .limit(100)
        .get();

      console.log(`Found ${ordersSnapshot.size} orders needing shipment`);
      
      for (const orderDoc of ordersSnapshot.docs) {
        // Create shipment record
        await db.collection(SHIPMENTS_COLLECTION).add({
          orderId: orderDoc.id,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      console.log('✅ Shipment processing complete');
    } catch (error) {
      console.error('❌ Shipment processing error:', error);
    }
  });

// Local development
if (require.main === module) {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`\n✅ Nekxuz Backend running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`💳 Razorpay Mode: PRODUCTION`);
    console.log(`📦 Database: Firebase Firestore\n`);
  });
}
