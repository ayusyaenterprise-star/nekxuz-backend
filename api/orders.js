const admin = require('firebase-admin');

// Initialize Firebase
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

  if (req.method === 'GET') {
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

      // Fetch orders from Firebase
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

      return res.status(200).json({
        ok: true,
        orders,
        count: orders.length
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
