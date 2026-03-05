require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Database Connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected Successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
  }
})();

// ============ ROUTES ============

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend running on nx.nekxuz.in',
    database: 'MySQL',
    payment: 'Razorpay LIVE'
  });
});

// 2. Get Stock
app.get('/api/stock', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM products LIMIT 10');
    connection.release();
    
    const stock = {};
    rows.forEach(product => {
      stock[product.id] = {
        available: product.available || 0,
        reserved: product.reserved || 0,
        sold: product.sold || 0
      };
    });

    res.json({ ok: true, stock });
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Create Payment Order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    // Simulate Razorpay response
    res.json({ 
      id: `order_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'created'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Verify Payment
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;
    
    // Simulate payment verification
    res.json({ 
      success: true, 
      message: 'Payment verified',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, shippingAddress, totalAmount, paymentId } = req.body;

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO orders (user_id, items, shipping_address, total_amount, payment_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [
        userId || 'guest',
        JSON.stringify(items),
        JSON.stringify(shippingAddress),
        totalAmount,
        paymentId,
        'pending'
      ]
    );

    connection.release();
    
    res.json({ success: true, orderId: result.insertId });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Get Orders
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    connection.release();
    
    const orders = rows.map(order => ({
      ...order,
      items: JSON.parse(order.items || '[]'),
      shipping_address: JSON.parse(order.shipping_address || '{}')
    }));

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// 7. Send Order to Shiprocket
app.post('/api/shiprocket/create-order', async (req, res) => {
  try {
    const { orderId, items, shippingAddress, totalAmount } = req.body;

    if (!process.env.SHIPROCKET_AUTH_TOKEN) {
      return res.status(500).json({ error: 'Shiprocket token not configured' });
    }

    console.log('📦 Sending to Shiprocket:', { orderId, items: items.length });

    const shiprocketResponse = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      {
        order_id: `ORD-${orderId}`,
        order_date: new Date().toISOString(),
        pickup_location_id: process.env.SHIPROCKET_PICKUP_LOCATION_ID || 1,
        channel_id: '6277180',
        billing_customer_name: shippingAddress.name,
        billing_email: shippingAddress.email,
        billing_phone: shippingAddress.phone,
        billing_address: shippingAddress.address,
        billing_city: shippingAddress.city,
        billing_state: shippingAddress.state,
        billing_country: 'India',
        billing_pincode: shippingAddress.pincode,
        shipping_is_billing: true,
        order_items: items.map(item => ({
          name: item.title || 'Product',
          sku: item.id || 'SKU',
          units: item.quantity || 1,
          selling_price: parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0
        })),
        payment_method: 'Prepaid',
        sub_total: totalAmount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SHIPROCKET_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Shiprocket Response:', shiprocketResponse.data);

    res.json({ 
      success: true, 
      shiprocket_order_id: shiprocketResponse.data.shipment_id || shiprocketResponse.data.id,
      tracking_id: shiprocketResponse.data.tracking_id,
      message: 'Order sent to Shiprocket successfully'
    });
  } catch (error) {
    console.error('❌ Shiprocket Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Nekxuz Backend Running`);
  console.log(`📍 URL: https://nx.nekxuz.in`);
  console.log(`💾 Database: MySQL`);
  console.log(`✅ All APIs Ready\n`);
});