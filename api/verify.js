const Razorpay = require('razorpay');
const crypto = require('crypto');
const admin = require('firebase-admin');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_SMqkVvPnni1H3X",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "Yv4Bd637j5fjHGJ7hrPe1vDV"
});

// Initialize Firebase (if using Firebase for storage)
let db = null;
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "nekxuz-27e49",
      credential: admin.credential.applicationDefault()
    });
  }
  db = admin.firestore();
} catch (e) {
  console.log('Firebase not initialized:', e.message);
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version'
};

function setCorsHeaders(res) {
  Object.keys(corsHeaders).forEach(header => {
    res.setHeader(header, corsHeaders[header]);
  });
}

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).end();
    return;
  }

  setCorsHeaders(res);

  if (req.method === 'POST') {
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

      // Verify Razorpay signature
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

      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpayPaymentId);

      if (payment.status !== 'captured') {
        return res.status(400).json({
          ok: false,
          error: 'Payment not captured'
        });
      }

      // Save order to Firebase (if available)
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

          // Also save payment record
          await db.collection('payments').doc(razorpayPaymentId).set({
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            amount: payment.amount / 100,
            status: 'captured',
            createdAt: new Date().toISOString()
          });
        } catch (firebaseError) {
          console.error('Firebase save error:', firebaseError);
          // Continue anyway - payment was verified
        }
      }

      return res.status(200).json({
        ok: true,
        message: 'Payment verified successfully',
        orderId,
        status: 'completed'
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      return res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
