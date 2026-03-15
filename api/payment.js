const Razorpay = require('razorpay');
const crypto = require('crypto');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  try {
    const razorpay = new Razorpay({
      key_id: "rzp_live_SMqkVvPnni1H3X",
      key_secret: "Yv4Bd637j5fjHGJ7hrPe1vDV"
    });

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

    return res.status(200).json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: "rzp_live_SMqkVvPnni1H3X"
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};
