// Root API endpoint for Vercel
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version'
};

module.exports = (req, res) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  Object.keys(corsHeaders).forEach(header => {
    res.setHeader(header, corsHeaders[header]);
  });

  return res.status(200).json({
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
};
