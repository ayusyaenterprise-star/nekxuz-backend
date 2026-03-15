const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay with production keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_SMqkVvPnni1H3X",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "Yv4Bd637j5fjHGJ7hrPe1vDV"
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version'
};

// Handle CORS
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
      const { amount, currency = 'INR', invoiceNumber, email } = req.body;

      if (!amount || !invoiceNumber) {
        return res.status(400).json({
          ok: false,
          error: 'Missing amount or invoiceNumber'
        });
      }

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency,
        receipt: invoiceNumber,
        notes: {
          email: email,
          invoice: invoiceNumber
        }
      });

      return res.status(200).json({
        ok: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_SMqkVvPnni1H3X"
      });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
