require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Prisma with better connection handling
const prisma = new PrismaClient({
  errorFormat: 'pretty',
  log: ['error', 'warn']
});

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

    console.log(`[/api/orders] Getting orders for: ${email}`);

    const orders = await prisma.order.findMany({
      where: { buyerEmail: email },
      include: { payments: true, shipment: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    console.log(`[/api/orders] Found ${orders.length} orders`);

    res.json({ 
      ok: true,
      orders: orders.map(o => ({
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
        buyerPincode: o.buyerPincode,
        shipment: o.shipment
      }))
    });
  } catch (err) {
    console.error('[/api/orders] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ Nekxuz API Server running on port ${PORT}`);
  console.log(`📍 Listening on http://0.0.0.0:${PORT}`);
  
  // Test database
  try {
    const count = await prisma.order.count();
    console.log(`✅ Database connected - ${count} total orders`);
  } catch (err) {
    console.error('❌ Database error:', err.message);
  }
});

// Graceful shutdown
async function shutdown() {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Server closed');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Unhandled error handler
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});
