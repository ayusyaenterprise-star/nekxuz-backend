const Razorpay = require('razorpay');
const crypto = require('crypto');
const admin = require('firebase-admin');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  try {
    const razorpay = new Razorpay({
      key_id: "rzp_live_SMqkVvPnni1H3X",
      key_secret: "Yv4Bd637j5fjHGJ7hrPe1vDV"
    });

    // Initialize Firebase
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: "nekxuz-27e49"
      });
    }
    const db = admin.firestore();

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
      .createHmac('sha256', "Yv4Bd637j5fjHGJ7hrPe1vDV")
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

    // Save to Firestore
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
    } catch (e) {
      console.error('Firestore error:', e);
    }

    return res.status(200).json({
      ok: true,
      message: 'Payment verified successfully',
      orderId,
      status: 'completed'
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};
