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
    // Initialize Firebase
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: "nekxuz-27e49"
      });
    }
    const db = admin.firestore();

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        ok: false,
        error: 'Email is required'
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

    return res.status(200).json({
      ok: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};
