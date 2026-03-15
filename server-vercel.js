const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_SMqkVvPnni1H3X",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "Yv4Bd637j5fjHGJ7hrPe1vDV"
});

// Initialize Firebase Admin SDK
let db = null;
try {
  if (!admin.apps.length) {
    // For Vercel, we'll use Application Default Credentials
    // Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "nekxuz-27e49"
    });
  }
  db = admin.firestore();
  console.log('✅ Firebase Firestore initialized');
} catch (e) {
  console.error('❌ Firebase initialization error:', e.message);
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Nekxuz Backend Running on Vercel',
    version: '2.0',
    platform: 'Vercel Serverless',
    razorpay_mode: 'PRODUCTION',
    endpoints: {
      payment: '/api/payment',
      verify: '/api/verify',
      orders: '/api/orders'
    },
    timestamp: new Date().toISOString()
  });
});

// CREATE RAZORPAY ORDER
app.post('/api/payment', async (req, res) => {
  try {
    const { amount, currency = 'INR', invoiceNumber, email } = req.body;

    if (!amount || !invoiceNumber) {
      return res.status(400).json({
        ok: false,
        error: 'Missing amount or invoiceNumber'
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: currency,
      receipt: invoiceNumber,
      notes: { email, invoice: invoiceNumber }
    });

    res.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_SMqkVvPnni1H3X"
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// VERIFY PAYMENT & SAVE TO FIRESTORE
app.post('/api/verify', async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
      email,
      invoiceNumber,
      amount,
      cartItems,
      shippingAddress
    } = req.body;

    // Verify signature
    const hmac = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "Yv4Bd637j5fjHGJ7hrPe1vDV")
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (hmac !== razorpaySignature) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid payment signature'
      });
    }

    // Verify with Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (payment.status !== 'captured') {
      return res.status(400).json({
        ok: false,
        error: 'Payment not captured'
      });
    }

    // Save to Firebase Firestore
    if (db) {
      try {
        await db.collection('orders').doc(orderId).set({
          orderId,
          invoiceNumber,
          email,
          amount,
          status: 'completed',
          razorpayOrderId,
          razorpayPaymentId,
          cartItems,
          shippingAddress,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        await db.collection('payments').doc(razorpayPaymentId).set({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          amount: payment.amount / 100,
          status: 'captured',
          createdAt: new Date().toISOString()
        });

        console.log(`✅ Order ${orderId} saved to Firestore`);
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
      }
    }

    res.json({
      ok: true,
      message: 'Payment verified successfully',
      orderId,
      status: 'completed'
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// GET ORDERS FOR EMAIL
app.get('/api/orders', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        ok: false,
        error: 'Email is required'
      });
    }

    if (!db) {
      return res.status(500).json({
        ok: false,
        error: 'Database not connected'
      });
    }

    const ordersSnapshot = await db
      .collection('orders')
      .where('email', '==', email)
      .orderBy('createdAt', 'desc')
      .get();

    const orders = [];
    ordersSnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      ok: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    ok: false,
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Nekxuz backend running on port ${PORT}`);
});

module.exports = app;
