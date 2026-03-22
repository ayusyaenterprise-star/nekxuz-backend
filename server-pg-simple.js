require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Simple PostgreSQL connection pool
let pgClient;

async function getDBConnection() {
  if (!pgClient) {
    pgClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    await pgClient.connect();
  }
  return pgClient;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

// Get Orders by Email
app.get('/api/orders', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: "email parameter required" });
    }

    console.log(`[GET /api/orders] email=${email}`);

    const client = await getDBConnection();
    
    const result = await client.query(
      `SELECT * FROM "Order" WHERE "buyerEmail" = $1 ORDER BY "createdAt" DESC LIMIT 50`,
      [email]
    );

    console.log(`[GET /api/orders] Found ${result.rows.length} orders`);

    res.json({ 
      ok: true,
      orders: result.rows.map(o => ({
        id: o.id,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        createdAt: o.createdAt,
        subtotal: o.subtotal,
        tax: o.tax,
        shippingCharges: o.shippingCharges,
        buyerName: o.buyerName,
        buyerEmail: o.buyerEmail,
        buyerPhone: o.buyerPhone,
        buyerAddress: o.buyerAddress,
        buyerCity: o.buyerCity,
        buyerState: o.buyerState,
        buyerPincode: o.buyerPincode
      }))
    });
  } catch (err) {
    console.error('[GET /api/orders] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ Nekxuz API Server running on port ${PORT}`);
  
  try {
    const client = await getDBConnection();
    const result = await client.query('SELECT COUNT(*) FROM "Order"');
    console.log(`✅ Database connected - ${result.rows[0].count} total orders`);
  } catch (err) {
    console.error('❌ Database error:', err.message);
  }
});

// Graceful shutdown
async function shutdown() {
  console.log('\n🛑 Shutting down...');
  if (pgClient) {
    await pgClient.end();
  }
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => {
  console.error('❌ Error:', err);
  shutdown();
});
