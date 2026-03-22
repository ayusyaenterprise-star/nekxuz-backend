#!/usr/bin/env node
/**
 * Simple PostgreSQL-only backend server
 * No Prisma dependency - direct PG connection
 * Runs on Render with DATABASE_URL environment variable
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, Pool } = require('pg');
const Razorpay = require('razorpay');

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize Razorpay
let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay initialized');
  } else {
    console.warn('⚠️ Razorpay keys not set - payments will fail');
  }
} catch (err) {
  console.error('❌ Razorpay initialization failed:', err.message);
}

console.log('='.repeat(60));
console.log('🚀 Nekxuz Backend Starting...');
console.log('='.repeat(60));

// Log environment
console.log('\n📋 Configuration:');
console.log(`   Node Version: ${process.version}`);
console.log(`   PORT: ${PORT}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   SHIPROCKET_EMAIL: ${process.env.SHIPROCKET_EMAIL ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   SHIPROCKET_PASSWORD: ${process.env.SHIPROCKET_PASSWORD ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   SHIPROCKET_PICKUP_LOCATION_ID: ${process.env.SHIPROCKET_PICKUP_LOCATION_ID ? '✅ SET: ' + process.env.SHIPROCKET_PICKUP_LOCATION_ID : '❌ NOT SET'}`);
console.log(`   SHIPROCKET_DEBUG: ${process.env.SHIPROCKET_DEBUG ? '✅ SET: ' + process.env.SHIPROCKET_DEBUG : '❌ NOT SET'}`);

if (process.env.DATABASE_URL) {
  // Mask password for logging
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@');
  console.log(`   DB String: ${maskedUrl}`);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// PostgreSQL Pool (better than single connection)
let pool;

// Shiprocket Token Cache
let shiprocketToken = null;
let shiprocketTokenExpiry = 0;

// Get Shiprocket Auth Token
async function getShiprocketToken() {
  try {
    // Check if token is still valid
    if (shiprocketToken && Date.now() < shiprocketTokenExpiry) {
      console.log('   ✅ Using cached Shiprocket token');
      return shiprocketToken;
    }

    console.log('   🔐 Fetching new Shiprocket token...');
    console.log(`   📧 Email: ${process.env.SHIPROCKET_EMAIL ? process.env.SHIPROCKET_EMAIL.substring(0, 10) + '...' : 'NOT SET'}`);
    console.log(`   🔑 Password: ${process.env.SHIPROCKET_PASSWORD ? 'SET (****)' : 'NOT SET'}`);

    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      console.error('   ❌ Shiprocket credentials not set in environment!');
      console.error('   ❌ Add SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD to Render settings');
      return null;
    }

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      })
    });

    const data = await response.json();
    
    if (!data.token) {
      console.error('   ❌ Shiprocket auth failed');
      console.error('   ❌ Response:', JSON.stringify(data, null, 2));
      return null;
    }

    shiprocketToken = data.token;
    shiprocketTokenExpiry = Date.now() + (23 * 60 * 60 * 1000); // 23 hours
    console.log('   ✅ Shiprocket token obtained (expires in 23 hours)');
    return shiprocketToken;
  } catch (err) {
    console.error('   ❌ Shiprocket auth error:', err.message);
    console.error('   ❌ Stack:', err.stack);
    return null;
  }
}

// Create Shipment in Shiprocket
async function createShipmentInShiprocket(orderData) {
  try {
    console.log(`   📦 Creating Shiprocket shipment for order: ${orderData.orderId}`);
    
    const token = await getShiprocketToken();
    if (!token) {
      console.error('   ⚠️ Cannot create shipment - no Shiprocket token. Check env vars!');
      return null;
    }

    // Parse buyer name into first and last name
    const nameParts = (orderData.buyerName || 'Customer Unknown').split(' ');
    const buyerFirstName = nameParts[0] || 'Customer';
    const buyerLastName = nameParts.slice(1).join(' ') || 'Order';

    // Format order items with required Shiprocket fields
    const formattedItems = (orderData.items || []).map((item, idx) => ({
      name: item.name || `Item ${idx + 1}`,
      units: item.units || item.quantity || 1,
      selling_price: item.price || 0,
      sku: item.sku || `SKU-${item.id || idx}`,
      hsn_code: item.hsn_code || '',
      manufacturer: item.manufacturer || 'Nekxuz',
      product_id: item.product_id || item.id || `prod-${idx}`
    }));

    const payload = {
      order_id: orderData.orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location_id: parseInt(process.env.SHIPROCKET_PICKUP_LOCATION_ID || '1'),
      billing_customer_name: buyerFirstName,
      billing_last_name: buyerLastName,
      billing_email: orderData.buyerEmail,
      billing_phone: orderData.buyerPhone,
      billing_address: orderData.buyerAddress,
      billing_city: orderData.buyerCity,
      billing_state: orderData.buyerState,
      billing_country: 'India',
      billing_pincode: orderData.buyerPincode,
      shipping_is_billing: true,
      order_items: formattedItems,
      payment_method: 'Prepaid',
      sub_total: orderData.subtotal || 0,
      shipping_charges: orderData.shippingCharges || 0,
      cod_amount: 0,
      // Dimensions at top level (required by Shiprocket)
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    console.log(`   📍 Pickup Location ID: ${process.env.SHIPROCKET_PICKUP_LOCATION_ID || '1'}`);
    console.log(`   📍 Items to ship: ${payload.order_items.length}`);

    if (process.env.SHIPROCKET_DEBUG === 'true') {
      console.log('   � Shiprocket payload:', JSON.stringify(payload, null, 2));
    }

    console.log('   🌐 Sending to Shiprocket API...');
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log(`   📊 Shiprocket Response Status: ${response.status}`);

    if (!response.ok) {
      console.error('   ❌ Shiprocket API Error (HTTP ' + response.status + ')');
      console.error('   ❌ Error details:', JSON.stringify(result, null, 2));
      return null;
    }

    if (result.success || result.shipment_id) {
      console.log(`   ✅ Shipment created in Shiprocket!`);
      console.log(`   🎫 Shipment ID: ${result.data?.shipment_id || 'pending'}`);
      console.log(`   📦 Order ID: ${result.data?.order_id || 'pending'}`);
      return {
        success: true,
        shipment_id: result.data?.shipment_id,
        order_id: result.data?.order_id,
        packages: result.data?.packages || []
      };
    } else {
      console.error('   ❌ Shiprocket returned success=false');
      console.error('   ❌ Message:', result.message);
      console.error('   ❌ Full response:', JSON.stringify(result, null, 2));
      return null;
    }
  } catch (err) {
    console.error('   ❌ Shiprocket shipment creation failed!');
    console.error('   ❌ Error:', err.message);
    console.error('   ❌ Stack:', err.stack);
    return null;
  }
}

async function initDB() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable not set!');
    console.error('   Set it on Render dashboard: Settings → Environment');
    process.exit(1);
  }

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const testClient = await pool.connect();
    const result = await testClient.query('SELECT NOW()');
    testClient.release();
    
    console.log('\n✅ Database Connection: SUCCESS');
    console.log(`   Connected at: ${result.rows[0].now}`);
    
    // Count orders
    const countResult = await pool.query('SELECT COUNT(*) as count FROM "Order"');
    console.log(`   Total Orders in DB: ${countResult.rows[0].count}`);
    
    return true;
  } catch (err) {
    console.error('\n❌ Database Connection FAILED:');
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code}`);
    
    // Helpful diagnostics
    if (err.code === 'ECONNREFUSED') {
      console.error('   → Database server unreachable. Check URL and network.');
    } else if (err.code === 'ENOTFOUND') {
      console.error('   → Hostname not found. Check database URL spelling.');
    } else if (err.code === 'FATAL') {
      console.error('   → Authentication failed. Check username/password.');
    }
    
    return false;
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'API is healthy',
    database: pool ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Get Orders by Email
app.get('/api/orders', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'email parameter required',
        example: '/api/orders?email=test@example.com'
      });
    }

    console.log(`\n📨 GET /api/orders?email=${email}`);

    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const result = await pool.query(
      `SELECT * FROM "Order" WHERE "buyerEmail" = $1 ORDER BY "createdAt" DESC LIMIT 50`,
      [email]
    );

    console.log(`   ✅ Found ${result.rows.length} orders`);

    // Calculate count for response
    const count = result.rows.length;

    res.json({ 
      ok: true,
      orders: result.rows,
      count: count,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    res.status(500).json({ 
      error: err.message,
      ok: false
    });
  }
});

// Get all orders (admin only - for testing)
app.get('/api/orders/all', async (req, res) => {
  try {
    console.log(`\n📨 GET /api/orders/all`);

    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const result = await pool.query(
      `SELECT id, amount, buyerEmail, createdAt FROM "Order" ORDER BY "createdAt" DESC LIMIT 100`
    );

    console.log(`   ✅ Found ${result.rows.length} total orders`);

    res.json({ 
      ok: true,
      orders: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    res.status(500).json({ 
      error: err.message,
      ok: false
    });
  }
});

// Get specific order by ID
app.get('/api/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log(`\n📨 GET /api/order/${orderId}`);

    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const result = await pool.query(
      `SELECT * FROM "Order" WHERE "id" = $1 LIMIT 1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Order not found',
        ok: false
      });
    }

    console.log(`   ✅ Found order ${orderId}`);

    res.json({ 
      ok: true,
      order: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    res.status(500).json({ 
      error: err.message,
      ok: false
    });
  }
});

// Get shipment tracking info for an order
app.get('/api/order/:orderId/tracking', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log(`\n📨 GET /api/order/${orderId}/tracking`);

    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const result = await pool.query(
      `SELECT "shipmentData" FROM "Order" WHERE "id" = $1 LIMIT 1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Order not found',
        ok: false
      });
    }

    const shipmentData = result.rows[0].shipmentData;
    console.log(`   ✅ Found tracking for order ${orderId}`);

    res.json({ 
      ok: true,
      orderId: orderId,
      shipment: shipmentData,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    res.status(500).json({ 
      error: err.message,
      ok: false
    });
  }
});

// Create Razorpay Order for Payment
app.post('/api/payment/create-order', async (req, res) => {
  try {
    console.log('💳 POST /api/payment/create-order');
    
    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay not initialized' });
    }

    const { amount, currency = 'INR', invoiceNumber } = req.body;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit
      currency,
      receipt: invoiceNumber || 'REC-' + Date.now(),
    };

    console.log('   Creating Razorpay order:', { amount, currency });
    const order = await razorpay.orders.create(options);
    console.log(`   ✅ Order created: ${order.id}`);
    
    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID  // ✅ ADDED - Send key to frontend
    });
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    res.status(500).json({ 
      error: err.message,
      ok: false
    });
  }
});

// Verify Razorpay Payment
app.post('/api/payment/verify', async (req, res) => {
  try {
    console.log('✅ POST /api/payment/verify');
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoicePayload } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Verify signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('   ❌ Signature mismatch');
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    console.log(`   ✅ Payment verified: ${razorpay_payment_id}`);

    // Save order to database
    if (invoicePayload && pool) {
      try {
        const {
          billing_customer_name,
          billing_email,
          billing_address,
          billing_city,
          billing_state,
          billing_pincode,
          billing_phone,
          shipping_charges
        } = invoicePayload;

        // Calculate subtotal and tax from order items
        let subtotal = 0;
        if (invoicePayload.order_items && Array.isArray(invoicePayload.order_items)) {
          subtotal = invoicePayload.order_items.reduce((sum, item) => {
            return sum + ((item.selling_price || 0) * (item.units || 1));
          }, 0);
        }

        const tax = Math.round(subtotal * 0.09); // 9% GST
        const shippingCost = shipping_charges || 0;
        const totalAmount = subtotal + tax + shippingCost;

        // Create shipment in Shiprocket FIRST
        console.log(`   📦 Creating shipment in Shiprocket...`);
        const shipmentResult = await createShipmentInShiprocket({
          orderId: razorpay_payment_id,
          buyerName: billing_customer_name,
          buyerEmail: billing_email,
          buyerPhone: billing_phone,
          buyerAddress: billing_address,
          buyerCity: billing_city,
          buyerState: billing_state,
          buyerPincode: billing_pincode,
          subtotal: subtotal,
          shippingCharges: shippingCost,
          items: invoicePayload.order_items || []
        });

        // Prepare shipment data for storage
        const shipmentData = shipmentResult ? {
          shipment_id: shipmentResult.shipment_id,
          order_id: shipmentResult.order_id,
          awb: shipmentResult.packages?.[0]?.awb || null,
          courier: shipmentResult.packages?.[0]?.courier || null,
          status: 'processing',
          created_at: new Date().toISOString()
        } : null;

        // Insert order with shipment data
        const result = await pool.query(
          `INSERT INTO "Order" (
            id, invoice, amount, currency, status, 
            subtotal, tax, "shippingCharges", 
            "buyerName", "buyerEmail", "buyerPhone", 
            "buyerAddress", "buyerCity", "buyerState", "buyerPincode",
            "shipmentData",
            "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET 
            status = $5, 
            "shipmentData" = $16,
            "updatedAt" = NOW()
          RETURNING *`,
          [
            razorpay_payment_id,
            `invoice_${razorpay_payment_id}`,
            totalAmount,
            'INR',
            'paid',
            subtotal,
            tax,
            shippingCost,
            billing_customer_name,
            billing_email,
            billing_phone,
            billing_address,
            billing_city,
            billing_state,
            billing_pincode,
            JSON.stringify(shipmentData)
          ]
        );

        console.log(`   💾 Order saved to database: ${razorpay_payment_id}`);
        if (shipmentData) {
          console.log(`   📦 Shipment data stored: AWB=${shipmentData.awb}, Courier=${shipmentData.courier}`);
        }

        return res.json({
          ok: true,
          message: 'Payment verified and order saved',
          orderId: razorpay_payment_id,
          invoice: `invoice_${razorpay_payment_id}`,
          shipment: shipmentResult || { success: false, message: 'Shipment creation pending' }
        });
      } catch (dbErr) {
        console.error('   ⚠️ Database save error:', dbErr.message);
        // Still return success even if DB save fails
        return res.json({
          ok: true,
          message: 'Payment verified (database save pending)',
          orderId: razorpay_payment_id,
          invoice: `invoice_${razorpay_payment_id}`
        });
      }
    }

    res.json({
      ok: true,
      message: 'Payment verified successfully',
      orderId: razorpay_payment_id,
      invoice: `invoice_${razorpay_payment_id}`
    });
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    res.status(500).json({ 
      error: err.message,
      ok: false
    });
  }
});

// Save Order to Database
app.post('/api/orders/save', async (req, res) => {
  try {
    console.log('💾 POST /api/orders/save');
    
    const {
      id,
      invoice,
      amount,
      currency,
      status,
      subtotal,
      tax,
      shippingCharges,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerAddress,
      buyerCity,
      buyerState,
      buyerPincode
    } = req.body;

    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    // Insert or update order
    const result = await pool.query(
      `INSERT INTO "Order" (
        id, invoice, amount, currency, status, 
        subtotal, tax, "shippingCharges", 
        "buyerName", "buyerEmail", "buyerPhone", 
        "buyerAddress", "buyerCity", "buyerState", "buyerPincode",
        "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET 
        status = $5, 
        "updatedAt" = NOW()
      RETURNING *`,
      [
        id, invoice, amount, currency, status,
        subtotal, tax, shippingCharges,
        buyerName, buyerEmail, buyerPhone,
        buyerAddress, buyerCity, buyerState, buyerPincode
      ]
    );

    console.log(`   ✅ Order saved: ${id}`);
    res.json({
      ok: true,
      order: result.rows[0],
      message: 'Order saved successfully'
    });
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    res.status(500).json({ 
      error: err.message,
      ok: false
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
async function start() {
  // Initialize database connection
  const dbOk = await initDB();
  
  if (!dbOk && process.env.NODE_ENV === 'production') {
    console.error('\n⚠️  Database connection failed. Continuing anyway...\n');
  }

  // Start HTTP server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🌐 Server listening on 0.0.0.0:${PORT}`);
    console.log(`\n📍 Available endpoints:`);
    console.log(`   GET  /health`);
    console.log(`   GET  /api/health`);
    console.log(`   GET  /api/orders?email=user@example.com`);
    console.log(`   GET  /api/orders/all`);
    console.log(`   GET  /api/order/:orderId`);
    console.log(`   POST /api/payment/create-order`);
    console.log(`   POST /api/payment/verify`);
    console.log(`   POST /api/orders/save`);
    console.log('\n' + '='.repeat(60) + '\n');
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n\n🛑 Shutting down gracefully...');
    if (pool) {
      await pool.end();
      console.log('✅ Database pool closed');
    }
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    shutdown();
  });
}

// Start the application
start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
