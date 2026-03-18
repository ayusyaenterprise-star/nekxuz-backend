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

const app = express();
const PORT = process.env.PORT || 3002;

console.log('='.repeat(60));
console.log('🚀 Nekxuz Backend Starting...');
console.log('='.repeat(60));

// Log environment
console.log('\n📋 Configuration:');
console.log(`   Node Version: ${process.version}`);
console.log(`   PORT: ${PORT}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET'}`);

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
